import { Command, Flags, Args, ux } from '@oclif/core';
import { connect, routes } from '../system.js'

interface ModelInstallationRequest {
  id?: string,
  url?: string,
  name?: string
}

export default class Add extends Command {
  static description = 'You can install a model in runtime, while the API is running and it is started already. Furthermore, you can install a model from a URL or from a gallery.';

  static examples = [
    '<%= config.bin %> <%= command.id %> github:go-skynet/model-gallery/gpt4all-j.yaml --name gpt4all-j',
    '<%= config.bin %> <%= command.id %> TheBloke/dolphin-2.2.1-mistral-7B-GGUF/dolphin-2.2.1-mistral-7b.Q4_0.gguf --name magic',
    '<%= config.bin %> <%= command.id %> <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)',
    '<%= config.bin %> <%= command.id %> https://github.com/go-skynet/model-gallery/blob/main/openllama_3b.yaml',

  ];

  static flags = {
    name: Flags.string({ char: 'n', description: 'Optional name for the installed model', required: false }),
    // Add any other flags you need here.
  };

  static args = {
    id: Args.string({ description: 'Gallery ID or URL identifier of the model', required: true }),
    // Include any additional arguments here.
  };
  static progressBar = ux.progress({
    format: 'Progress |' + '{bar}' + '| {percentage}% | Downloaded: {downloaded} | Total: {total} | Status: {status}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  static helpfulHints = [
    'To install a model from a gallery, use the following format: <GALLERY>@<MODEL_NAME> (e.g., model-gallery@bert-embeddings)',
    'To install a model from a URL, use the following format: ',
    `Consider trying this command: ${Add.examples[Math.floor(Math.random() * Add.examples.length)]}`
  ]
  createModelInstallationRequest = (input: string, name: string): ModelInstallationRequest => {
    const inferInputAsUrl = input.startsWith('github:go') || input.startsWith('http')
    const result = name ? { name } : {}

    if (inferInputAsUrl) return { ...result, url: input }

    return { ...result, id: input }
  }
  initializeProgressBar = () => {
    Add.progressBar.start(100, 0, { downloaded: 'N/A', total: 'N/A', status: 'Starting...' });  
  }
  pollJobStatus = async (jobId: string) => {
    try {
      const jobStatusResponse = await connect.get(`${routes.models_jobs}/${jobId}`);
      const workingJobDetails = jobStatusResponse.data;

      Add.progressBar.update(workingJobDetails.progress, {
        downloaded: workingJobDetails.downloaded_size,
        total: workingJobDetails.file_size,
        status: workingJobDetails.message
      });
      if (workingJobDetails.processed) {
        Add.progressBar.stop();
        console.log('Installation completed.');
        console.log(workingJobDetails.message);
        console.log('Please update your template files as outlined in https://localai.io/howtos/easy-model/');
        console.log('Restart the service to apply the changes.');
        console.log('Verify the installation using `lai status`.');
        console.log(`Test the installed model using \`lai benchmark ${Add.flags.name || Add.args.id}\`.`);
      } else {
        setTimeout(() => this.pollJobStatus(jobId), 100);
      }
    } catch (error: any) {
      Add.progressBar.stop();
      this.error(error.message);
    }
  }
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Add);
    const id = args.id;
    const name = flags.name;
    try {
      const modelInstallationResponse = await connect.post(routes.models_apply, {
        headers: { 'Content-Type': 'application/json' },
        data: this.createModelInstallationRequest(id, name || '')
      })
      this.initializeProgressBar();
      ux.action.start('Installing model');
      await this.pollJobStatus(modelInstallationResponse.data.job_id);

      ux.action.stop('Installation completed');
    } catch (error: any) {
      // can we get all of tthe properties of the error object?
      
      ux.action.stop('Failed');
      // Check for specific types of errors and respond accordingly
      if (error.response && error.response.status === 404) {
        this.error('Model not found. Please check the model ID or URL.');
      } else if (error.response && error.response.status === 500) {
        this.error('Request Failed. Please check the model ID or URL');
      } else {
        // Fallback for other types of errors
        this.error('An unexpected error occurred: ' + error.message);
      }
        this.error(error.message);
      }
  }
  
}
