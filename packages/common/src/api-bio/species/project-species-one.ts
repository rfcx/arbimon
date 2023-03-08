import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type TaxonSpeciesCallTypes, type TaxonSpeciesPhotoTypes } from '../../dao/types'
import { type SpeciesInProject } from '../../dao/types/species-in-project'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

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
  speciesPhotos: Array<TaxonSpeciesPhotoTypes['light']>
  speciesCalls: Array<TaxonSpeciesCallTypes['light']>
  predictedOccupancyMaps: PredictedOccupancyMap[]
}

// Route
export const projectSpeciesOneRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species/:speciesSlug`

// Service
export const apiBioGetProjectSpeciesOne = async (apiClient: AxiosInstance, projectId: number, speciesSlug: string): Promise<ProjectSpeciesOneResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/species/${speciesSlug}`)
