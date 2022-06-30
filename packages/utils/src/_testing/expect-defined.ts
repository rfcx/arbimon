import { AssertionError } from 'assert'

export function expectDefined <T> (val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) throw new AssertionError({ message: 'Expected \'val\' to be defined', actual: val })
}
