import { type AxiosInstance } from 'axios'

import { type ProjectType } from '../../dao/types'

// Request type
export interface ProjectCreateRequest {
  name: string
  projectType?: ProjectType
  hidden?: boolean
  objectives?: string[]
  associatedOrganizations?: string
  dateStart?: string
  dateEnd?: string // undefined => ongoing
}

// Response type
export interface ProjectCreateResponse {
  slug: string
}

// Route
export const projectCreateRoute = '/projects'

// Service
export const apiBioPostProjectCreate = async (apiClient: AxiosInstance, payload: ProjectCreateRequest): Promise<ProjectCreateResponse> =>
  await apiClient.post(projectCreateRoute, payload, { headers: { 'Content-Type': 'application/json' } }).then(res => res.data)
