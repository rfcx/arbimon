export interface FilterDataset {
  projectVersionId: number
  startDateUtcInclusive: string
  endDateUtcInclusive: string
  siteIds: number[]
  taxons: number[]
}
