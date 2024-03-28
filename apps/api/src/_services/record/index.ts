/**
 * Reverse the value and the key of the given object
 *
 * ```typescript
 * const record = {
 *   x: 2,
 *   y: 3
 * }
 *
 * const reversedRecord = reverseRecord(record)
 * // {
 * //   2: 'x'
 * //   3: 'y'
 * // }
 * ```
 */
export const reverseRecord = <
  T extends PropertyKey,
  U extends PropertyKey,
>(input: Record<T, U>): Record<U, T> => {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      value,
      key
    ])
  )
}
