import {Hook} from '@oclif/core'
import dotenv from 'dotenv'

const hook: Hook<'init'> = async function (opts) {
  dotenv.config()
}

export default hook
