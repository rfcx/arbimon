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

export interface TagResponse {
  count: number
  tag: string
  tag_id: number
}

export const apiArbimonGetTags = async (apiClient: AxiosInstance, slug: string): Promise<TagResponse[] | undefined> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/tags/recording`)
  return response.data
}
