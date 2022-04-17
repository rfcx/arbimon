export const sleep = async (ms = 500): Promise<void> =>
  await new Promise(resolve => setTimeout(resolve, ms))

export const promiseSequential = async <T>(promises: Array<Promise<T>>): Promise<T[]> => {
  const results: T[] = []
  for (const promise of promises) {
    results.push(await promise)
  }
  return results
}

export const getSequentiallyKeyed = async <T>(keys: string[], getter: (key: string) => Promise<T | undefined>, minWait = 500): Promise<Record<string, T>> => {
  const results: Record<string, T> = {}

  for (const key of keys) {
    const [result] = await Promise.all([getter(key), sleep(minWait)])
    if (result !== undefined) results[key] = result
  }

  return results
}
