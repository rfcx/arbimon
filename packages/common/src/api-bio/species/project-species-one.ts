import { TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '../../dao/types'
import { SpeciesInProject } from '../../dao/types/species-in-project'
import { ProjectSpecificRouteParams } from '../_helpers'

// Request
export type ProjectSpeciesOneParams = ProjectSpecificRouteParams & {
  speciesSlug: string
}

export const projectSpeciesOneRoute = '/projects/:projectId/species/:speciesSlug'

export const projectSpeciesOneGeneratedUrl = (params: ProjectSpeciesOneParams): string =>
  `/projects/${params.projectId}/species/${params.speciesSlug}`

// Response
export interface PredictedOccupancyMap {
  title: string
  url: string
}

export interface ProjectSpeciesOneResponse {
  speciesInformation: SpeciesInProject
  speciesPhotos: TaxonSpeciesPhotoLight[]
  speciesCalls: TaxonSpeciesCallLight[]
  predictedOccupancyMaps: PredictedOccupancyMap[]
}
