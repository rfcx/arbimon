import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { LocationProjectLight } from '../../dao/types'

// Request types
// nothing specific...

// Response types
export type LocationProjectForUser =
  LocationProjectLight &
  {
    isMyProject: boolean
    hasPublishedVersions: boolean
    hasPublicVersions: boolean
  }

export type ProjectsResponse = LocationProjectForUser[]

// Route
export const projectsRoute = '/projects'

// Service
export const apiBioGetProjects = async (apiClient: AxiosInstance): Promise<ProjectsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, projectsRoute)
