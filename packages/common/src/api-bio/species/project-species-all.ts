import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { SpeciesInProjectLight } from '../../dao/types/species-in-project'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type ProjectSpeciesAllParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectSpeciesAllResponse {
  species: SpeciesInProjectLight[]
}

// Route
export const projectSpeciesAllRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species`

// Service
export const apiBioGetProjectSpeciesAll = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectSpeciesAllResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/species`)
