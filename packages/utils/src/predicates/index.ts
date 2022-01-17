export function isDefined<T> (val: T | undefined): val is T {
  return val !== undefined
}
