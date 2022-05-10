export interface FilterDatasetQuery {
  dateStartUtcInclusive: string
  dateEndUtcInclusive: string
  siteIds: string[]
  taxonClassIds: string[]
}
