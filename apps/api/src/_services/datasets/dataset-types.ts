export interface FilterDataset {
  locationProjectId: number
  startDateUtcInclusive: string
  endDateUtcInclusive: string
  siteIds: number[]
  taxons: number[]
  taxonSpeciesId?: number
}
