import { requireEnv } from './load'
import { PROTECTION_VALUES } from './types'

export const limitUnlessProtected = <T> (input: T[]): T[] =>
  requireEnv('PROTECTION').PROTECTION === PROTECTION_VALUES.OFF
    ? input.slice(0, 3)
    : input
