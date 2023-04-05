import { type AxiosInstance } from 'axios'

import { apiPostOrUndefined } from '@rfcx-bio/utils/api'

// Request type
export interface ProjectCreateRequest {
  name: string
  associatedOrganizations: string
}

// Response type
export interface ProjectCreateResponse {
  slug: string
}

// Route
export const projectCreateRoute = '/projects'

// Service
export const apiBioPostProjectCreate = async (apiClient: AxiosInstance, payload: ProjectCreateRequest): Promise<ProjectCreateResponse | undefined> =>
  await apiPostOrUndefined(apiClient, projectCreateRoute, payload, { headers: { 'Content-Type': 'application/json' } })
