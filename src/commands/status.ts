import {ux} from '@oclif/core'
import {BaseCommand, routes} from '../system.js'

import {AxiosModelStatusResponse, Model} from '../system.js'

export default class Status extends BaseCommand {
  static description = 'Shows currently active models'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    ux.action.start('Checking for active models')
    try {
      const response = await this.connect<AxiosModelStatusResponse>(routes.models_active)
      ux.action.stop()
      const modelList = response.data.data

      ux.styledHeader('Active Models')
      if (modelList.length === 0) {
        this.log('No active models found')
        this.log('Use `lai add` to install a model.')
        this.log('To see a list of locally available (but not installed) models, use `lai list -local`')
      } else {
        const modelsAsRecords = modelList.map((model: Model) => {
          return {
            id: model.id,
          }
        })
        this.log('These models are currently active and ready for use')
        this.log('They were derived from existing models in the /models directory')

        ux.table(modelsAsRecords, {
          id: {
            minWidth: 20,
            header: 'ID',
          },
        })
        this.log('To see a list of locally available (but not installed) models, use `lai list -local`')
        this.log(`also try: 'lai check ${modelList[0].id}' to validate the model`)
      }
    } catch (error: any) {
      ux.action.stop('failed')
      throw error
    }
  }
}
