import { FilterDatasetQuery } from '../common/filter'

// Request
export interface RichnessDatasetParams {
  projectId: string
}

export type RichnessDatasetQuery = FilterDatasetQuery

export const richnessDatasetRoute = '/projects/:projectId/richness'

export const richnessDatasetUrl = (params: RichnessDatasetParams): string =>
  `/projects/${params.projectId}/spotlight`

// Response
export interface RichnessDatasetResponse {
  detectionCount: number
  speciesByTaxon: { [taxon: string]: number }
  // speciesBySite: MapSiteData[]
  // speciesByTime: Record<TimeBucket, Record<number, number>>
  // speciesPresence: { [speciesId: string]: SpeciesLight }
}
