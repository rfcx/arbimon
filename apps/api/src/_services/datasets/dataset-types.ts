export interface FilterDataset {
  projectId: number
  startDateUtcInclusive: string
  endDateUtcInclusive: string
  siteIds: number[]
  taxons: number[]
}
