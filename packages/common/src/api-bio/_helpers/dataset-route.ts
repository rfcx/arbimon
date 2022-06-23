export interface DatasetQueryParams {
  dateStartInclusiveLocalIso?: string
  dateEndInclusiveLocalIso?: string
  siteIds?: number[]
  taxonClassIds?: number[]
}

export interface DatasetQueryParamsSerialized {
  dateStartInclusiveLocalIso: string
  dateEndInclusiveLocalIso: string
  siteIds: string[] | string // empty arrays get serialized as ''
  taxonClassIds: string[] | string // empty arrays get serialized as ''
}

const stringKeys = ['dateStartInclusiveLocalIso', 'dateEndInclusiveLocalIso'] as const
const numberArrayKeys = ['siteIds', 'taxonClassIds'] as const

export const datasetQueryParamsToString = (params: DatasetQueryParams): URLSearchParams => {
  // Extract string pairs (if any)
  const stringPairs = stringKeys
    .flatMap(key => params[key] ? [[key, params[key]] as [string, string]] : [])

  // Extract number[] pairs (if any)
  const numberArrayPairs = numberArrayKeys
    .flatMap(key => params[key]?.map(v => [key, v.toString()] as [string, string]) ?? [])

  // Merge as query string
  return new URLSearchParams([...stringPairs, ...numberArrayPairs])
}
