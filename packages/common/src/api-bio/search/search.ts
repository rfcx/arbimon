import { type AxiosInstance } from 'axios'

import { type LocationProjectCountry, type LocationProjectMetric, type LocationProjectProfile, type Organization, type OrganizationType, type Project } from '@/dao/types'

export const SEARCH_TYPE = ['project', 'organization'] as const
export type SearchType = typeof SEARCH_TYPE[number]

export interface SearchRequestQueryParams {
  type?: SearchType
  q?: string
  limit?: string
  offset?: string
}

export type SearchResponseProject = { type: 'project', avgLatitude: number, avgLongitude: number }
  & Pick<Project, 'id' | 'idCore' | 'idArbimon' | 'name' | 'slug'>
  & Pick<LocationProjectProfile, 'image' | 'objectives' | 'summary'>
  & Pick<LocationProjectMetric, 'speciesCount' | 'recordingMinutesCount'>
  & Pick<LocationProjectCountry, 'countryCodes'>
export type SearchResponseOrganization = { type: 'organization', organizationType: OrganizationType } & Pick<Organization, 'id' | 'image' | 'name' | 'url'>

export interface RawElasticSearchResponseBody<T> {
  took: number
  timed_out: false
  _shards: {
    total: number
    successful: number
    skipped: number
    failed: number
  }
  hits: {
    total: {
      value: number
      relation: string
    }
    max_score: number | null
    hits: T[]
  }
}

// INFO:
// These 2 interfaces has to be kept in sync with `./apps/pgsync/src/schema.json`
// Nulls have to be kept because that's how they're synced to.
// This is so bad since elasticsearch client 7.10's type system is not yet finished :(
export interface SearchQueryProjectRawResponse {
  _index: 'location_project'
  _type: string
  _id: string
  _score: number
  _source: {
    id: number
    id_core: string
    id_arbimon: number
    name: string
    slug: string
    latitude_north: number
    latitude_south: number
    longitude_east: number
    longitude_west: number
    location_project_profile: {
      summary: string
      date_start: string
      date_end: string | null
      objectives: string[]
      image: string
    } | null
    location_project_country: {
      location_project_id: number
      country_codes: string[]
    } | null
    location_project_metric: {
      location_project_id: number
      species_count: number
      recording_minutes_count: number
      detection_minutes_count: number
      min_date: string
      max_date: string
      recording_min_date: string
      recording_max_date: string
      detection_min_date: string
      detection_max_date: string
    } | null
  }
}

export interface SearchQueryOrganizationRawResponse {
  _index: 'location_project'
  _type: string
  _id: string
  _score: number
  _source: {
    id: number
    name: string
    type: OrganizationType
    url: string
    image: string | null
  }
}

export const xSearchTotalCountHeaderName = 'x-search-total-count'
export const searchRoute = '/search'
export type SearchResponse = Array<SearchResponseProject | SearchResponseOrganization>

export const apiBioSearch = async (apiClient: AxiosInstance, type: SearchType, query: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const response = await apiClient.request<SearchResponse>({
    method: 'GET',
    url: searchRoute,
    params: {
      type,
      q: query,
      limit,
      offset
    }
  })

  let totalCount = 0
  const rawHeader = response.headers?.[xSearchTotalCountHeaderName]
  if (rawHeader !== undefined && rawHeader !== '' && !Number.isNaN(Number(rawHeader))) {
    totalCount = Number(rawHeader)
  }

  return {
    total: totalCount,
    data: response.data
  }
}
