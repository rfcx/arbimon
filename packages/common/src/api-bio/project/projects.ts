import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type LocationProjectProfile, type LocationProjectTypes, type Project } from '../../dao/types'

// Request types
export interface LocationProjectQuery {
  limit?: number
  offset?: number
}

export interface DirectoryProjectsQuery {
  full?: boolean
  ids?: string
  keywords?: string
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

export type ProjectLight = Pick<Project, 'id' | 'slug' | 'name'> & {
  avgLatitude: number
  avgLongitude: number
}

export type ProjectProfileWithMetrics = ProjectLight & Pick<LocationProjectProfile, 'summary' | 'objectives' > & {
  avgLatitude: number
  avgLongitude: number
  isPublished: boolean
  noOfRecordings: number
  noOfSpecies: number
  countries: string[]
  imageUrl: string
}

export type ProjectsResponse = LocationProjectForUser[]

export interface MyProjectsResponse {
  data: LocationProjectWithInfo[]
  offset: number
  limit: number
  total: number
}

export type DirectoryProjectsResponse = ProjectLight[] | ProjectProfileWithMetrics[]

// Route
export const projectsRoute = '/projects'
export const projectDirectoryRoute = '/directory/projects'
export const myProjectsRoute = '/me/projects'

// Service
export const apiBioGetProjects = async (apiClient: AxiosInstance): Promise<ProjectsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, projectsRoute)

export const apiBioGetMyProjects = async (apiClient: AxiosInstance, limit?: number, offset?: number): Promise<MyProjectsResponse | undefined> => {
  let url = myProjectsRoute
  // TODO: should be using `params` - needs testing:
  // const params = { limit, offset }
  // return await apiGetOrUndefined(apiClient, url, { params })
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

export const apiBioGetDirectoryProjects = async (apiClient: AxiosInstance, query: DirectoryProjectsQuery): Promise<DirectoryProjectsResponse | undefined> => {
  let url = projectDirectoryRoute
  // TODO: should be using `params` - needs testing:
  // const params = { ids, keywords, full: query.full ? '1' : '0' }
  // return await apiGetOrUndefined(apiClient, url, { params })
  if (query.full !== undefined) {
    url = url + '?full=' + (query.full ? '1' : '0')
  }
  if (query.ids !== undefined) {
    url = url + '&ids=' + query.ids.toString()
  }
  if (query.keywords !== undefined) {
    url = url + '&keywords=' + query.keywords.toString()
  }
  return await apiGetOrUndefined(apiClient, url)
}
