export const groupByNumber = <T>(data: T[], keySelector: ((k: T) => number)): Record<number, T[]> => {
  const result: Record<number, T[]> = {}

  for (const datum of data) {
    const key = keySelector(datum)
    if (!(key in result)) {
      result[key] = [datum]
    } else {
      result[key].push(datum)
    }
  }

  return result
}
