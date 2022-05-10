export interface FilterDataset {
  locationProjectId: number
  dateStartUtcInclusive: string
  dateEndUtcInclusive: string
  siteIds: number[]
  taxons: number[]
}
