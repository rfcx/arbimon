import { FilterDatasetQuery } from '../common/filter'
import { SpeciesCountByTaxonName } from './common'

// Request
export interface RichnessDatasetParams {
  projectId: string
}

export type RichnessDatasetQuery = FilterDatasetQuery

export const richnessDatasetRoute = '/projects/:projectId/richness'

export const richnessDatasetUrl = (params: RichnessDatasetParams): string =>
  `/projects/${params.projectId}/richness`

// Response
export interface RichnessDatasetResponse {
  isLocationRedacted: boolean
  detectionCount: number
  speciesByTaxon: SpeciesCountByTaxonName
  // speciesBySite: MapSiteData[]
  // speciesByTime: Record<TimeBucket, Record<number, number>>
  // speciesPresence: { [speciesId: string]: SpeciesLight }
}
