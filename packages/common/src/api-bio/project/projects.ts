import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type LocationProjectProfile, type LocationProjectTypes, type Project } from '../../dao/types'

// Request types
export interface LocationProjectQuery {
  limit?: number
  offset?: number
}

export interface DirectoryProjectsQuery {
  light?: boolean
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
  isHighlighted: boolean
  isMock: boolean // TODO: remove this
}

export type ProjectProfileWithMetrics = ProjectLight & Pick<LocationProjectProfile, 'summary' | 'objectives' > & {
  avgLatitude: number
  avgLongitude: number
  isHighlighted: boolean
  isMock: boolean // TODO: remove this
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

export type DirectoryProjectsResponse = ProjectProfileWithMetrics[]

// Route
export const projectsRoute = '/projects'
export const projectDirectoryRoute = '/directory/projects'
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

// export const apiBioGetDirectoryProjects = async (apiClient: AxiosInstance): Promise<ProjectsResponse | undefined> => {}
