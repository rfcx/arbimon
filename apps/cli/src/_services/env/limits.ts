import { env } from './env'
import { OFF } from './keys'

export const limitUnlessProtected = <T> (input: T[]): T[] =>
  env.PROTECTION === OFF
    ? input.slice(0, 3)
    : input
