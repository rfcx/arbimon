import { Species } from './types'

// Request
export interface ProjectSpeciesOneParams {
  projectId: string
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
  speciesInformation: Species
  predictedOccupancyMaps: PredictedOccupancyMap[]
}
