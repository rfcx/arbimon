import { SpeciesInProject, TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '../../dao/types'
import { ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type ProjectSpeciesOneParams = ProjectSpecificRouteParams & {
  speciesSlug: string
}

export const projectSpeciesOneRoute = '/projects/:projectId/species/:speciesSlug'

export const projectSpeciesOneUrl = (params: ProjectSpeciesOneParams): string =>
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
