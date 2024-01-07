import {Args, Command, Flags, handle, ux} from '@oclif/core'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {BaseCommand, routes} from '../system.js'
import {findSimilarStrings} from '../tools.js'
import {Model, AxiosModelStatusResponse} from '../system.js'
import {AxiosResponse} from 'axios'
import inquirer from 'inquirer'

type ChatRole = 'system' | 'user' | 'assistant'

interface OpenAICompletionMessage {
  role: ChatRole
  content: string
}

interface OpenAICompletionPrompt {
  model: string
  messages: OpenAICompletionMessage[]
}

interface RsponseMessage {
  content: string
}
interface Choice {
  message: RsponseMessage
  index: number
  logprobs?: number[] // or any more complex structure depending on API details
  finish_reason: string
}

interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface CompletionResponse extends AxiosResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Choice[]
  usage: Usage
}

interface ShorthandCompletionPrompt {
  model: string
  system: string
  user: string
  assistant?: string
}

export default class Prompt extends BaseCommand {
  static summary = 'Send a prompt to the given <MODEL_NAME>'
  static description =
    'Sends a quick prompt to a model, and returns the response.\n' +
    'Use the -u and -s flags to customize the prompt.\n' +
    'Use "lai status" to see a list of active models.\n' +
    'Use the -h flag to see more options.\n\n' +
    'Aliases: check, c, p'
  static hiddenAliases = ['c', 'check', 'p']

  static examples = [
    {
      description: 'Send default prompt to a model (good for testing)',
      command: '<%= config.bin %> <%= command.id %> lunademo',
    },
    {
      description: 'Send a custom prompt to a model',
      command: '<%= config.bin %> <%= command.id %> lunademo --system "answer questions" --user "What is your name?"',
    },
  ]
  static usage = 'prompt <MODEL_NAME> -u [user-prompt] -s [system-prompt] --help'
  static flags = {
    json: Flags.boolean({
      char: 'j',
      description: 'Print the raw JSON response',
      default: false,
    }),
    'char-limit': Flags.integer({
      char: 'c',
      description:
        'The maximum number of characters before truncation warning. truncate is ignored when using JSON or when multiple choices are returned.',
      default: 60,
    }),
    timeout: Flags.integer({
      char: 't',
      description: 'The maximum number of seconds to wait for a response',
      default: 90,
    }),
    assistant: Flags.string({
      char: 'a',
      description: 'The assistant message to send to the model',
      required: false,
    }),
    system: Flags.string({
      char: 's',
      description: 'The system message to send to the model',
      default: 'Finish the sentence in 10 words or less:',
    }),
    user: Flags.string({
      char: 'u',
      description: 'The user message to send to the model',
      default: 'Once upon a time, ',
      required: true,
    }),
    request: Flags.boolean({
      char: 'r',
      description: 'Print the curl command used to send the prompt',
      default: false,
    }),
  }
  static buildPrompt = (prompt: ShorthandCompletionPrompt): OpenAICompletionPrompt => {
    const messages: OpenAICompletionMessage[] = [
      {
        role: 'system',
        content: prompt.system,
      },
      {
        role: 'user',
        content: prompt.user,
      },
    ]
    if (prompt.assistant) {
      messages.push({
        role: 'assistant',
        content: prompt.assistant,
      })
    }
    return {
      model: prompt.model,
      messages,
    }
  }

  static validatedModel: string

  static args = {
    MODEL_NAME: Args.string({description: 'name of model to prompt', required: true}),
    // Include any additional arguments here.
  }

  validateModelExists = async (modelId: string): Promise<void> => {
    ux.action.start(`Checking if ${modelId} is active`)
    const {data} = await this.connect.get<AxiosModelStatusResponse>(routes.models_active)

    if (!data.data.length) {
      throw new CLIError('No Active Models', {
        code: 'ENOMODELS',
        suggestions: [
          `lai add ${modelId} to add the model`,
          'Search for models using `lai list`',
          'You can get started with lunademo by running `lai add lunademo`',
          'see https://localai.io/howtos/easy-model/ for more information',
        ],
      })
    }
    const modelExists = data.data.some((model: Model) => model.id === modelId)

    if (!modelExists) {
      const similar = findSimilarStrings(
        modelId,
        data.data.map((model: Model) => model.id),
      )
      console.log(similar)
      ux.action.stop('not found')
      if (similar.length > 0) {
        const answers = await inquirer.prompt({
          type: 'confirm',
          name: 'useTopSuggestion',
          message: `Model '${modelId}' not found. Did you mean '${similar[0]}'?`,
          default: false,
        })
        if (answers.useTopSuggestion) {
          Prompt.validatedModel = similar[0]

          return await this.validateModelExists(similar[0])
        }
        if (!answers.useTopSuggestion) {
          throw new CLIError('Model not found', {
            code: 'EMODELNOTFOUND',
            suggestions: [
              `Maybe you meant one of these: ${similar.join(', ')}`,
              `Verify the model is active by running \`lai status\``,
            ],
          })
        }
      } else {
        throw new CLIError('Model not found', {
          code: 'EMODELNOTFOUND',
          suggestions: [`Verify the model is active by running \`lai status\``],
        })
      }
    }
  }
  public async init(): Promise<void> {
    const {args, flags} = await this.parse(Prompt)
    await super.init()

    await this.validateModelExists(args.MODEL_NAME)
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Prompt)

    const startTime = Date.now()
    const prompt = Prompt.buildPrompt({
      model: Prompt.validatedModel,
      system: flags.system,
      user: flags.user,
      assistant: flags.assistant,
    })
    if (flags.request) {
      ux.styledHeader('Request')
      ux.styledJSON(prompt)
    }
    ux.action.start('Awaiting response from model: ' + Prompt.validatedModel + '...')
    const response = await this.connect.post<CompletionResponse>(routes.completions, prompt, {
      timeout: flags.timeout * 1000,
    })

    const responseText = response.data.choices[0].message.content

    const endTime = Date.now()
    const duration = endTime - startTime
    const choices = response.data.choices
    const choiceCount = choices.length
    const limitExceeded = responseText.length > flags['char-limit']
    const charlimit = flags['char-limit']
    ux.action.stop('Complete')

    if (flags.json) {
      ux.styledJSON({
        request: prompt,
        response: response.data,
      })

      return
    }

    let truncate = false
    let showAllChoices = false
    if (limitExceeded && choiceCount === 1) {
      const answers = await inquirer.prompt({
        type: 'confirm',
        name: 'truncate',
        message: `Response is longer than ${flags['char-limit']} characters. Do you want to truncate it?`,
        default: false,
      })
      truncate = answers.truncate
    }
    if (choices.length > 1) {
      const answers = await inquirer.prompt({
        type: 'confirm',
        name: 'showAllChoices',
        message: `Multiple choices were returned. Do you want to see all of them (Truncation will be ignored)?`,
        default: false,
      })
      showAllChoices = answers.showAllChoices
    }

    ux.styledHeader('Prompt response')
    if (showAllChoices) {
      ux.styledHeader('All choices (ignoring truncation)')
      ux.styledJSON(choices)
    }

    if (truncate) {
      responseText.slice(0, charlimit)
    }

    if (!responseText) {
      this.warn(ux.colorize('yellow', 'No response was returned.\n'))
      this.warn(
        'The API doesn’t inject a default prompt for talking to the model. \n' +
          'You have to use a prompt similar to what’s described in the ' +
          ux.url('standford-alpaca docs', 'https://github.com/tatsu-lab/stanford_alpaca#data-release', {
            color: 'blue',
          }),
      )
      this.log('See also:\n')
      this.log('\t' + ux.url('Simple example', 'https://localai.io/howtos/easy-model/', {color: 'blue'}))
      this.log('\t' + ux.url('Model configuration guide', 'https://localai.io/advanced/', {color: 'blue'}))
      return
    }

    const charCount = responseText.length
    const charPerSecond = duration > 0 ? (charCount / duration).toFixed(2) : 'N/A'

    this.log(ux.colorize('green', responseText))
    this.log('')
    this.log(`Duration: ${duration}ms`)
    this.log(`Characters: ${charCount}`)
    this.log(`Characters per second: ${charPerSecond}`)

    if (limitExceeded) {
      this.warn('The response exceeded the maximum number of characters.')
      if (choices.length === 1) {
        this.warn('You chose' + (truncate ? ' ' : ' not ') + 'to truncate the response.')
      } else {
        this.warn('Truncation was ignored because the model returned multiple choices.')
      }
      if (charlimit < 30) {
        this.warn('Charlimit less than 30 is not recommended.')
      }

      if (charlimit < 60) {
        this.log('sometimes models ignore instructions and return more characters than requested.')
        this.log('You may need to alter the system prompt (e.g., -s "Finish the sentence in 10 words or less:")')
        this.log('Some models may ignore the system prompt altogether.')
        this.log('Try adding rules to your user prompt (e.g., -u "limit to 10 words: Once upont a time,")')
        this.log('')
      }
      if (choices.length > 1) {
        this.warn('A total of ' + choices.length + ' choices were returned.')
        this.warn('You chose' + (showAllChoices ? ' ' : ' not ') + 'to see all of them.')
      }
      this.log('')

      this.log('Use the -j flag to see the raw JSON response.')

      if (!flags.request) {
        this.log('Use the -r flag to see the curl command used to send the prompt.')
      } else {
        const curlCommand = `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(prompt)}' ${
          routes.completions
        }`
        this.log(curlCommand)
        this.log('Omit the -r flag to hide the curl command used to send the prompt.')
      }
    }
  }
  async catch(error: any) {
    ux.action.stop('failed')
    if (error.code === 'ECONNABORTED') {
      return this.error(error.message, {
        code: 'ECONNABORTED',
        suggestions: [
          `Configured to abort after ${Prompt.flags.timeout} seconds.`,
          'Try increasing the timeout using the -t flag.',
          ' Example: lai prompt <MODEL_NAME> ' + ux.colorize('blue', '-t 120'),
          'Verify the model is running',
          ' try ' + ux.colorize('blue', 'lai status'),
        ],
      })
    } else {
      return this.catchCommonErrors(error)
    }
  }
  jsonEnabled(): boolean {
    return this.argv.includes('-j') || this.argv.includes('--json')
  }
}
