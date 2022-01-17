import { Temporal } from '@js-temporal/polyfill'

// slice to remove "Z" which PlainDate doesn't support
export const plainDate = (utcString: string): Temporal.PlainDate => Temporal.PlainDate.from(utcString.slice(0, -1))
