export interface FilterDataset {
  locationProjectId: number
  dateStartUtcInclusive: string
  dateEndUtcInclusive: string
  siteIds: number[]
  taxonClassIds: number[]
}
