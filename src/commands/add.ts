import {Command, Flags, Args, ux, Errors} from '@oclif/core'
import {routes, BaseCommand} from '../system.js'
import {handleCommonErrors, modelInstallationRequestSchema} from '../tools.js'

interface ModelInstallationRequestWithId {
  id: string
  url?: string | null
  name?: string | null
}

interface ModelInstallationRequestWithUrl {
  id?: string | null
  url: string
  name?: string | null
}

type ModelInstallationRequest = ModelInstallationRequestWithId | ModelInstallationRequestWithUrl

export default class Add extends BaseCommand {
  static hiddenAliases = ['install', 'i', 'a']
  static examples = [
    '<%= config.bin %> <%= command.id %> github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j',
    '<%= config.bin %> <%= command.id %> TheBloke/dolphin-2.2.1-mistral-7B-GGUF/dolphin-2.2.1-mistral-7b.Q4_0.gguf --name mistral-7b',
    '<%= config.bin %> <%= command.id %> <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)',
    '<%= config.bin %> <%= command.id %> https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml --name openllama_3b',
  ]
  static helpfulHints = [
    'To install a model from a gallery, use the following format: <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)',
    'To install a model from a URL, use the following format: ',
    `Consider trying this command: ${Add.examples[Math.floor(Math.random() * Add.examples.length)]}`,
  ]
  static description = 'Install a model from a gallery or a URL' + '\n\n' + Add.helpfulHints.join('\n')
  static summary = 'Install a model from a gallery or a URL (lai add model-gallery@bluedemo or lai add <URL>)'

  hasDynamicHelp = true
  static flags = {
    name: Flags.string({char: 'n', description: 'Optional name for the installed model', required: false}),
    // Add any other flags you need here.
  }

  static args = {
    id: Args.string({description: 'Gallery ID or URL identifier of the model', required: true}),
    // Include any additional arguments here.
  }

  static progressBar = ux.progress({
    format:
      'Progress |' + '{bar}' + '| {percentage}% | Downloaded: {downloaded} | Total: {totalFileSize} | Status: {status}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  })

  static createModelInstallationRequest = (input: string, name: string): ModelInstallationRequest => {
    const inferInputAsUrl =
      input.startsWith('github:') || input.startsWith('http:') || input.startsWith('https:') || input.startsWith('/')
    const result = name ? {name} : {}

    const genericErrorSuggestions = [
      ' (model-gallery ID): lai add model-gallery@bert-embeddings --name bert-embeddings',
      ' (github): lai add github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j',
      ' (url): lai add https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml --name openllama_3b',
    ]

    if (inferInputAsUrl) {
      const {error} = modelInstallationRequestSchema.validate({url: input})
      if (error) {
        if (input.startsWith('github:')) {
          throw new Errors.CLIError('Invalid github format', {
            code: 'EINVALIDGITHUBURL',
            suggestions: [
              'Are you trying to install a model from a GitHub repository?',
              `github: URLs must be in the format: github:<USER>/<REPO>/<PATH_TO_MODEL_DEFINITION>`,
              'Example: lai add github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j',
            ],
          })
        }
        if (input.startsWith('http:') || input.startsWith('https:')) {
          throw new Errors.CLIError('Invalid URL format', {
            code: 'EINVALIDURL',
            suggestions: ['Verify the URL is correct', ...genericErrorSuggestions],
          })
        }
      }

      return {...result, url: input}
    }
    const {error} = modelInstallationRequestSchema.validate({id: input})
    if (error)
      throw new Errors.CLIError('Invalid model-gallery ID format', {
        code: 'EINVALIDMODELGALLERYID',
        suggestions: [
          'Verify the model-gallery ID is in the format: <GALLERY>@<MODEL_NAME>',
          'Alternatively, tou can try the following formats:',
          ...genericErrorSuggestions,
        ],
      })
    return {...result, id: input}
  }
  initializeProgressBar = (fileSize: string) => {
    Add.progressBar.start(100, 0, {downloaded: 'N/A', fileSize, status: 'Starting...'})
  }
  pollJobStatus = async (jobId: string) => {
    try {
      const jobStatusResponse = await this.connect.get(`${routes.models_jobs}/${jobId}`)
      const workingJobDetails = jobStatusResponse.data

      Add.progressBar.update(workingJobDetails.progress, {
        downloaded: workingJobDetails.downloaded_size,
        totalFileSize: workingJobDetails.file_size,
        status: workingJobDetails.message,
      })
      if (workingJobDetails.processed) {
        Add.progressBar.stop()
        this.log('Installation completed.')
        this.log('Please update your template files as outlined in https://localai.io/howtos/easy-model/')
        this.log('Restart the service to apply the changes.')
        this.log('Verify the installation using `lai status`.')
        this.log(`Test the installed model using \`lai benchmark ${Add.flags.name || Add.args.id}\`.`)
      } else {
        setTimeout(() => this.pollJobStatus(jobId), 100)
      }
    } catch (error: any) {
      Add.progressBar.stop()
      this.error(error)
    }
  }
  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
    const id = args.id
    const name = flags.name
    try {
      const modelInstallationResponse = await this.connect.post(routes.models_apply, {
        headers: {'Content-Type': 'application/json'},
        data: Add.createModelInstallationRequest(id, name || ''),
      })
      this.initializeProgressBar(modelInstallationResponse.data.file_size)
      ux.action.start('Installing model')
      await this.pollJobStatus(modelInstallationResponse.data.uuid)

      ux.action.stop('Installation completed')
    } catch (error: any) {
      ux.action.stop('Failed')
      handleCommonErrors(this, error)
    }
  }
}
