import * as dotenv from 'dotenv'

import { type envKeysOptional, envKeysRequired } from './keys'

dotenv.config()

export type Env = Record<typeof envKeysRequired[number], string> & Record<typeof envKeysOptional[number], string | undefined>
export const env = process.env as Env

envKeysRequired.forEach(key => {
  if (!env[key]) throw Error(`Missing required environment: ${key}`)
})
