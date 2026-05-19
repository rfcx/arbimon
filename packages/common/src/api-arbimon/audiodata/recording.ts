import type { AxiosInstance } from 'axios'

export interface RecordingSearchParams {
  limit?: number
  offset?: number
  output?: Array<'count' | 'date_range' | 'list'>
  sortBy?: string
  playlists?: number[]
  range?: string
  sites?: string[]
  sites_ids?: number[]
  soundscape_composition?: number[]
  soundscape_composition_annotation?: string[]
  tags?: number[]
  validations?: number[]
  presence?: string[]
  years?: number[]
  days?: number[]
  hours?: number[]
  months?: number[]
  classifications?: number[]
  classification_results?: string[]
  recIds?: number[]
}

export interface RecordingSearchResponse {
  count?: number
  date_range?: {
    min_date: string
    max_date: string
  }
  list?: any[]
}

export interface ClassesRecordingResponse {
  id: number
  project: number
  songtype: number
  songtype_name: string
  species: number
  species_name: string
  taxon: string
  vals_absent: number
  vals_present: number
}

function buildRecordingSearchQuery (params: RecordingSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams()
  const appendArray = (key: string, arr?: Array<string | number>): void => {
    if (arr && arr.length > 0) {
      arr.forEach(v => {
        searchParams.append(key, String(v))
      })
    }
  }

  if (params.limit !== undefined) searchParams.append('limit', String(params.limit))
  if (params.offset !== undefined) searchParams.append('offset', String(params.offset))
  if (params.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params.range) searchParams.append('range', params.range)

  appendArray('output', params.output)
  appendArray('playlists', params.playlists)
  appendArray('sites', params.sites)
  appendArray('sites_ids', params.sites_ids)
  appendArray('soundscape_composition', params.soundscape_composition)
  appendArray('soundscape_composition_annotation', params.soundscape_composition_annotation)
  appendArray('tags[]', params.tags)
  appendArray('validations', params.validations)
  appendArray('presence', params.presence)
  appendArray('years', params.years)
  appendArray('days', params.days)
  appendArray('hours', params.hours)
  appendArray('months', params.months)
  appendArray('classifications', params.classifications)
  appendArray('classification_results', params.classification_results)
  appendArray('recIds', params.recIds)

  return searchParams
}

export const apiArbimonGetRecordings = async (
  apiClient: AxiosInstance,
  slug: string,
  params: RecordingSearchParams
): Promise<RecordingSearchResponse | undefined> => {
  if (!slug) return undefined

  const searchParams = buildRecordingSearchQuery(params)

  const response = await apiClient.request<RecordingSearchResponse>({
    method: 'GET',
    url: `/legacy-api/project/${slug}/recordings/search`,
    params: {},
    paramsSerializer: () => searchParams.toString()
  })

  return response.data
}

export const apiArbimonGetClasses = async (apiClient: AxiosInstance, slug: string): Promise<ClassesRecordingResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<ClassesRecordingResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/classes?validations=true`
    })
    return response.data
  } else return undefined
}

export interface PlaylistResponse {
  count: number
  id: number
  metadata: any | null
  name: string
  project_id: number
  type: string
  uri: string | null
}

export const apiArbimonGetPlaylists = async (apiClient: AxiosInstance, slug: string): Promise<PlaylistResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<PlaylistResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/playlists`
    })
    return response.data
  } else return undefined
}
export interface SoundscapeResponse {
  id: number
  name: string
  system: number
  type: string
  typeId: number
}

export const apiArbimonGetSoundscape = async (apiClient: AxiosInstance, slug: string): Promise<SoundscapeResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<SoundscapeResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/soundscape-composition/classes?isSystemClass=1`
    })
    return response.data
  } else return undefined
}

export interface ClassificationsResponse {
  date: number
  job_id: number
  cname: string
  firstname: string
  lastname: string
  playlist_name: string
  playlist_id: number
  modname: string
  threshold: number | null
  model_id: number
}

export const apiArbimonGetClassifications = async (apiClient: AxiosInstance, slug: string): Promise<ClassificationsResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<ClassificationsResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/classifications`
    })
    return response.data
  } else return undefined
}

export interface TagResponse {
  count: number
  tag: string
  tag_id: number
}

export const apiArbimonGetTags = async (apiClient: AxiosInstance, slug: string): Promise<TagResponse[] | undefined> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/tags/recording`)
  return response.data
}

interface DateRange {
  from: string | Date
  to: string | Date
}

interface Filters {
  userEmail?: string
  range?: DateRange
}

interface Projection {
  recording?: string[]
  species?: number[]
  soundscapeComposition?: number[]
  tags?: number[]
  species_name?: string[]
  grouped?: string
  validation?: number[]
}

export interface ExportParams {
  filters: Filters
  show: Projection
}

export interface ExportResponse {
  success: boolean
}

export const apiLegacyExport = async (apiClient: AxiosInstance, slug: string, params: ExportParams): Promise<ExportResponse> => {
  let endpoint = 'recordings-export'
  if (params.show.species && params.show.species.length > 0) {
    endpoint = 'occupancy-models-export'
  } else if (params.show.grouped) {
    endpoint = 'grouped-detections-export'
  }

  const fullUrl = `/legacy-api/project/${slug}/recordings/${endpoint}`
  return await apiClient.post(fullUrl, params)
}

export interface RecordingParams {
  playlists?: number[]
  range?: string
  sites?: string[]
  sites_ids?: number[]
  soundscape_composition?: number[]
  soundscape_composition_annotation?: string[]
  tags?: number[]
  validations?: number[]
  presence?: string[]
  years?: number[]
  days?: number[]
  hours?: number[]
  months?: number[]
  classifications?: number[]
  classification_results?: string[]
  recIds?: number[]
}

export interface CreatePlaylistRequest {
  params: RecordingParams
  playlist_name: string
}
export interface CreatePlaylistResponse {
  playlist_id: number
  success: boolean
  error?: string
}

export function buildPlaylistsParamsObject (params: RecordingParams): Record<string, any> {
  const obj: Record<string, any> = {}

  const appendArray = (key: string, arr?: Array<string | number>): void => {
    if (arr && arr.length > 0) {
      obj[key] = arr
    }
  }

  if (params.range) obj.range = params.range

  appendArray('playlists', params.playlists)
  appendArray('sites', params.sites)
  appendArray('sites_ids', params.sites_ids)
  appendArray('soundscape_composition', params.soundscape_composition)
  appendArray('soundscape_composition_annotation', params.soundscape_composition_annotation)
  appendArray('tags', params.tags)
  appendArray('validations', params.validations)

  if (params.presence && params.presence.length === 1) {
    if (params.presence[0] === 'present') {
      obj.presence = 'present'
    } else if (params.presence[0] === 'absent') {
      obj.presence = 'absent'
    }
  }

  appendArray('years', params.years)
  appendArray('days', params.days)
  appendArray('hours', params.hours)
  appendArray('months', params.months)
  appendArray('classifications', params.classifications)
  appendArray('classification_results', params.classification_results)
  appendArray('recIds', params.recIds)

  return obj
}

export const apiLegacyCreatePlaylists = async (apiClient: AxiosInstance, slug: string, request: CreatePlaylistRequest): Promise<CreatePlaylistResponse> => {
  const body = {
    playlist_name: request.playlist_name,
    params: buildPlaylistsParamsObject(request.params)
  }
  const response = await apiClient.post(`/legacy-api/project/${slug}/playlists/create`, body)
  return response.data
}
export interface DeleteRecordingRequest {
  recs: any[]
}
export interface DeleteRecordingResponse {
  deleted: number[]
  msg: string
}
export const apiLegacyDeleteRecording = async (apiClient: AxiosInstance, slug: string, params: DeleteRecordingRequest): Promise<DeleteRecordingResponse> => {
  return await apiClient.post(`/legacy-api/project/${slug}/recordings/delete`, params)
}

export interface DeletemMatchingResponse {
  deleted: number[]
  msg: string
}

export const apiLegacyDeleteMatchingRecording = async (apiClient: AxiosInstance, slug: string, params: RecordingSearchParams): Promise<DeletemMatchingResponse> => {
  return await apiClient.post(`/legacy-api/project/${slug}/recordings/delete-matching`, Object.fromEntries(buildRecordingSearchQuery(params)))
}

export interface SearchCountResponse {
  count: number
  imported: number
  site: string
  site_id: number
}

export const apiLegacySearchCount = async (
  apiClient: AxiosInstance,
  slug: string,
  params: RecordingSearchParams
): Promise<SearchCountResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<SearchCountResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/recordings/search-count`,
      params
    })
    return response.data
  } else return undefined
}
export type LegacyAvailableResponse = Record<string, Record<string, Record<string, Record<string, number>>>>

export const apiLegacyGetAvailable = async (
  apiClient: AxiosInstance,
  slug: string,
  siteId: string | number,
  year: string | number
): Promise<LegacyAvailableResponse | undefined> => {
  if (!slug) return undefined

  const url = `/legacy-api/project/${slug}/recordings/available/!q:${siteId}-${year}-[1:12]`
  const response = await apiClient.request<LegacyAvailableResponse>({
    method: 'GET',
    url
  })

  return response.data
}

export type LegacyAvailableYearlyRaw = Record<string, Record<string, number>>

export async function apiLegacyGetAvailableYearly (
  apiClient: AxiosInstance,
  slug: string,
  siteId: string | number
): Promise<LegacyAvailableYearlyRaw | undefined> {
  if (typeof slug !== 'string' || slug.trim() === '') return undefined
  if (siteId === null || siteId === undefined) return undefined

  const url = `/legacy-api/project/${slug}/recordings/available/!q:${siteId}`
  const res = await apiClient.request<LegacyAvailableYearlyRaw>({ method: 'GET', url })
  return res.data
}
