import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '../../dao/types'
import { SpeciesInProject } from '../../dao/types/species-in-project'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type ProjectSpeciesOneParams = ProjectRouteParamsSerialized & {
  speciesSlug: string
}

// Response types
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

// Route
export const projectSpeciesOneRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species/:speciesSlug`

// Service
export const getSpeciesOne = async (apiClient: AxiosInstance, projectId: number, speciesSlug: string): Promise<ProjectSpeciesOneResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/species/${speciesSlug}`)
