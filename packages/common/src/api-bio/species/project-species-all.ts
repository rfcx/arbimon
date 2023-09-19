import { type AxiosInstance } from 'axios'

import { type SpeciesInProjectTypes } from '../../dao/types/species-in-project'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectSpeciesAllParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectSpeciesAllResponse {
  species: Array<SpeciesInProjectTypes['light']>
}

// Route
export const projectSpeciesAllRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species`

// Service
export const apiBioGetProjectSpeciesAll = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectSpeciesAllResponse> => {
  const response = await apiClient.get(`/projects/${projectId}/species`)
  return response.data
}
