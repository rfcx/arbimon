import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { SpeciesInProjectTypes } from '../../dao/types/species-in-project'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type ProjectSpeciesAllParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectSpeciesAllResponse {
  species: Array<SpeciesInProjectTypes['light']>
}

// Route
export const projectSpeciesAllRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species`

// Service
export const apiBioGetProjectSpeciesAll = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectSpeciesAllResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/species`)
