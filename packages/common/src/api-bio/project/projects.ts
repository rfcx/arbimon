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
    isMyProject: boolean // TODO: remove this field
  }

export type LocationProjectWithInfo = LocationProjectTypes['light'] &
{
  summary: string
  objectives: string[]
  countries: string[]
  image: string
}

export type ProjectLight = Pick<Project, 'id' | 'slug' | 'name'> & {
  latitudeAvg: number
  longitudeAvg: number
}

export type ProjectProfileWithMetrics = ProjectLight & Pick<LocationProjectProfile, 'summary' | 'objectives' > & {
  isPublished: boolean
  noOfRecordings: number
  noOfSpecies: number
  countries: string[]
  imageUrl: string
}

export type ProjectsResponse = Array<LocationProjectTypes['light']>
export type ProjectsGeoResponse = Array<LocationProjectTypes['geo']>

export interface MyProjectsResponse {
  data: LocationProjectWithInfo[]
  offset: number
  limit: number
  total: number
}

export type DirectoryProjectsResponse = ProjectLight[] | ProjectProfileWithMetrics[]

// Route
export const projectsGeoRoute = '/projects-geo'
export const projectsDeprecatedRoute = '/projects-deprecated'
export const projectDirectoryRoute = '/directory/projects'
export const myProjectsRoute = '/me/projects'
export const projectBySlugRoute = '/projects/:slug'

// Service
export const apiBioGetProjectsGeo = async (apiClient: AxiosInstance): Promise<Array<LocationProjectTypes['geo']>> =>
  await apiClient.get<Array<LocationProjectTypes['geo']>>(projectsGeoRoute, { params: { limit: 5000, offset: 0 } }).then(res => res.data)

export const apiBioGetProjectsDeprecated = async (apiClient: AxiosInstance): Promise<LocationProjectForUser[] | undefined> =>
  await apiGetOrUndefined(apiClient, projectsDeprecatedRoute)

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

export const apiBioGetProjectBySlug = async (apiClient: AxiosInstance, slug: string): Promise<LocationProjectForUser | undefined> => {
  const url = `/projects/${slug}`
  return await apiGetOrUndefined(apiClient, url)
}
