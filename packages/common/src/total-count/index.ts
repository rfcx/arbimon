export interface WithTotalCount<T> {
  total: number
  data: T
}

/**
 * Validate given value into number, returns 0 when cannot be correctly converted into valid number
 */
export const formatTotalCount = (input: unknown): number => {
  if (
    input === null ||
    input === undefined ||
    input === '' ||
    Number.isNaN(Number(input))
  ) {
    return 0
  }

  return Number(input)
}
