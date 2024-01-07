import axios, {AxiosInstance} from 'axios'
import {Command, Flags, ux} from '@oclif/core'
import {CLIError} from '@oclif/core/lib/errors/index.js'

export interface ModelInstallationRequestWithId {
  id: string
  url?: string | null
  name?: string | null
}

export interface ModelInstallationRequestWithUrl {
  id?: string | null
  url: string
  name?: string | null
}

export type ModelInstallationRequest = ModelInstallationRequestWithId | ModelInstallationRequestWithUrl

export interface Model extends Record<string, unknown> {
  id: string
  object: string
}

export interface AxiosModelStatusResponse {
  data: Model[]
}

export const routes = {
  models_apply: 'models/apply',
  models_available: 'models/available',
  models_active: 'models',
  models_jobs: 'models/jobs',
  completions: 'v1/chat/completions',
}

function buildBaseUri(address: string) {
  // Add protocol if missing
  if (!address.startsWith('http://') && !address.startsWith('https://')) {
    address = `http://${address}`
  }

  try {
    const url = new URL(address)
    return url.href // 'href' includes the trailing '/'
  } catch (error) {
    // If parsing fails for any reason, fallback to default with protocol
    return 'http://127.0.0.1:8080'
  }
}
export abstract class BaseCommand extends Command {
  static baseFlags = {
    address: Flags.string({
      char: 'a',
      description: 'Address of the Local AI server',
      default: '127.0.0.1:8080',
      required: false,
      env: 'ADDRESS',
    }),
  }
  protected connect!: AxiosInstance
  protected validateModelExists!: (modelId: string) => Promise<void>
  hostname!: string

  async init() {
    const {flags} = await this.parse(this.constructor as typeof BaseCommand)
    this.hostname = flags.address
    this.connect = axios.create({baseURL: buildBaseUri(flags.address)})
  }
  protected async catchCommonErrors(error: any) {
    if (error.code === 'ECONNREFUSED') {
      throw new CLIError(error.message, {
        code: 'ECONNREFUSED',
        suggestions: [
          `Is your service running at ${this.hostname}?`,
          'You may need to configure the address by setting the ADDRESS environment variable',
          'Example: ADDRESS=localhost:8080 lai status',
          'You can also set the address by passing the --address flag to the command',
          'Example: lai --address=localhost:8080 status',
        ],
      })
    } else {
      throw error
    }
  }
}
