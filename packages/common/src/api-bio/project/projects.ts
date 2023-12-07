import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type LocationProjectTypes } from '../../dao/types'

// Request types
export interface LocationProjectQuery {
  limit?: number
  offset?: number
}

// Response types
export type LocationProjectForUser =
  LocationProjectTypes['light'] &
  {
    isMyProject: boolean
    isShowcaseProject: boolean
  }

  export type LocationProjectWithInfo = LocationProjectTypes['light'] &
  {
    summary: string
    objectives: string[]
    countries: string[]
    image: string
    isPublished: boolean
  }

export type ProjectsResponse = LocationProjectForUser[]

export interface MyProjectsResponse {
  data: LocationProjectWithInfo[]
  offset: number
  limit: number
  total: number
}

// Route
export const projectsRoute = '/projects'
export const myProjectsRoute = '/me/projects'

// Service
export const apiBioGetProjects = async (apiClient: AxiosInstance): Promise<ProjectsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, projectsRoute)

export const apiBioGetMyProjects = async (apiClient: AxiosInstance, limit?: number, offset?: number): Promise<MyProjectsResponse | undefined> => {
  let url = myProjectsRoute
  if (limit !== undefined && offset !== undefined) {
    url = url + '?limit=' + limit.toString() + '&offset=' + offset.toString()
  } else {
    if (limit !== undefined) {
      url = url + '?limit=' + limit.toString()
    }
    if (offset !== undefined) {
      url = url + '?offset=' + offset.toString()
    }
  }

  return await apiGetOrUndefined(apiClient, url)
}
