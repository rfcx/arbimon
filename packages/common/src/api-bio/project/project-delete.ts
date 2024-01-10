import { type AxiosInstance } from 'axios'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectDeleteParams = ProjectRouteParamsSerialized

// Route
export const projectDeleteRoute = PROJECT_SPECIFIC_ROUTE_PREFIX

// Service
export const apiBioDeleteProject = async (apiClient: AxiosInstance, projectId: number): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`)
}
