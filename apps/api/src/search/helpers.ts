export const parseLimitOffset = (limit: string | number | undefined, offset: string | number | undefined, config: { maxOffset?: number, defaultLimit: number }): { limit: number, offset: number } => {
  let limitNumber = config.defaultLimit
  let offsetNumber = 0 // default offset is 0

  const parsedLimit = Number(limit)
  const parsedOffset = Number(offset)

  if (limit !== undefined && !Number.isNaN(parsedLimit)) {
    limitNumber = parsedLimit
  }

  if (offset !== undefined && !Number.isNaN(parsedOffset)) {
    offsetNumber = parsedOffset
  }

  if (config?.maxOffset !== undefined && offsetNumber > config.maxOffset) {
    offsetNumber = config.maxOffset
  }

  return {
    limit: limitNumber,
    offset: offsetNumber
  }
}

export const getAverageCoordinate = (x: number, y: number): number => {
  if (x === y) return x
  return (x + y) / 2
}
