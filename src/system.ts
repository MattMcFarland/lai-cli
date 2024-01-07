import axios, {AxiosInstance} from 'axios'
import {Command, Flags} from '@oclif/core'

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
  hostname!: string
  async init() {
    const {flags} = await this.parse(this.constructor as typeof BaseCommand)
    this.hostname = flags.address
    this.connect = axios.create({baseURL: buildBaseUri(flags.address)})
  }
}
