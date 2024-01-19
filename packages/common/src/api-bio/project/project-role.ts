import { type AxiosInstance } from 'axios'

import { type ProjectRole } from '../../roles'
import { PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Route
export const projectRoleRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/role`

// Service
export const apiBioGetProjectRole = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectRole> => {
  const response = await apiClient.get(projectRoleRoute.replace(':projectId', projectId.toString()))
  return response.data
}
