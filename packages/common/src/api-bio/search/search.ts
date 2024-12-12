import { type AxiosInstance } from 'axios'

import { type LocationProjectCountry, type LocationProjectMetric, type LocationProjectProfile, type Organization, type OrganizationType, type Project, type ProjectStatus } from '../../dao/types'

export const SEARCH_TYPE = ['project', 'organization'] as const
export type SearchType = typeof SEARCH_TYPE[number]

export interface SearchRequestQueryParams {
  type?: SearchType
  q?: string
  isPublished?: string
  limit?: string
  offset?: string
}

export type SearchResponseProject = { type: 'project', avgLatitude: number, avgLongitude: number, thumbnail?: string }
  & Pick<Project, 'id' | 'idCore' | 'idArbimon' | 'name' | 'slug' | 'status'>
  & Pick<LocationProjectProfile, 'image' | 'objectives' | 'summary' | 'readme'>
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

// INFO: This type has to be kept because opensearch does not have full typescript support.
// So to keep everything intact and not scream for potentially null references. This is needed.
// There has been a proposal for recreating a typescript-first opensearch client.
// See `https://github.com/opensearch-project/opensearch-js/issues/444`
// but seems like the author stopped working on it.
export interface SearchQueryProjectRawResponse {
  _index: 'projects'
  _type: string
  _id: string
  _score: number
  _source: {
    // from `location_project` table
    id_core: string
    id_arbimon: number
    name: string
    slug: string
    status: ProjectStatus
    latitude_north: number
    latitude_south: number
    longitude_east: number
    longitude_west: number

    // from `location_project_profile` table
    summary: string
    readme: string
    date_start: string | null
    date_end: string | null
    objectives: string[]
    image: string
    thumbnail?: string

    // from `location_project_country` materialized view
    country_codes: string[]

    // from `location_project_metric` materialized view
    species_count: number
    recording_minutes_count: number
    detection_minutes_count: number
    min_date: string | null
    max_date: string | null
    recording_min_date: string | null
    recording_max_date: string | null
    detection_min_date: string | null
    detection_max_date: string | null

    // expanded country name and objectives column
    expanded_country_names: string[]
    expanded_objectives: string[]

    species?: ProjectSpecies[]
  }
}

export interface ProjectSpecies {
  scientific_name: string
  common_name: string
  taxon_class: string
  is_threatened: boolean
  risk_rating_category?: string
  risk_rating?: string
  code?: string
  countries?: string[]
}

export interface SearchQueryOrganizationRawResponse {
  _index: 'organizations'
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

export const apiBioSearch = async (apiClient: AxiosInstance, type: SearchType, query: string, isPublished: boolean, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const response = await apiClient.request<SearchResponse>({
    method: 'GET',
    url: searchRoute,
    params: {
      type,
      q: query,
      isPublished,
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
