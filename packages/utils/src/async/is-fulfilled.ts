/**
 * For separating PromiseSettledResult in a type-safe manner
 *
 * @example
 * const results = await Promise.allSettled(...)
 * const fulfilled = results.filter(isFulfilled)
 * // OR
 * const [fulfilled, reject] = partition(results, isFulfilled)
 */
export function isFulfilled<T> (item: PromiseSettledResult<T>): item is PromiseFulfilledResult<T> {
  return item.status === 'fulfilled'
}
