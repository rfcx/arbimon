import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { ProjectLight } from '../../dao/types'

// Request types
// nothing specific...

// Response types
export type ProjectsResponse = ProjectForUser[]

export type ProjectForUser =
  ProjectLight &
  {
    isMyProject: boolean
    hasPublishedVersions: boolean
    hasPublicVersions: boolean
  }

// Route
export const projectsRoute = '/projects'

// Service
export const apiBioGetProjects = async (apiClient: AxiosInstance): Promise<ProjectsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, projectsRoute)
