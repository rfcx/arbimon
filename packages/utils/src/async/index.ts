export const wait = async (ms = 500): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export const getSequentially = async <T>(keys: string[], getter: (key: string) => Promise<T | undefined>, minWait = 2000): Promise<Record<string, T>> => {
  const results: Record<string, T> = {}

  for (const key of keys) {
    const [result] = await Promise.all([getter(key), wait(minWait)])
    if (result !== undefined) results[key] = result
  }

  return results
}
