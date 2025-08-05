import type { AxiosInstance } from 'axios'

export interface RecordingSearchParams {
  limit?: number
  offset?: number
  output?: Array<'count' | 'date_range' | 'list'>
  sortBy?: string
}

export interface RecordingSearchResponse {
  count?: number
  date_range?: {
    min: string
    max: string
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

export const apiArbimonGetRecordings = async (
  apiClient: AxiosInstance,
  slug: string,
  params: RecordingSearchParams
): Promise<RecordingSearchResponse | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<RecordingSearchResponse>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/recordings/search`,
      params: {
        ...params,
        output: params.output
      }
    })
    return response.data
  } else return undefined
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
