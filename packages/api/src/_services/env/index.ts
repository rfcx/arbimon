import * as dotenv from 'dotenv'

import { envKeysOptional, envKeysRequired } from './keys.js'

dotenv.config()

export type Env = Record<typeof envKeysRequired[number], string> & Record<typeof envKeysOptional[number], string | undefined>
export const env = process.env as Env

console.debug('Check env debugging => ', env)

envKeysRequired.forEach(key => {
  if (!env[key]) throw Error(`Missing required environment: ${key}`)
})
