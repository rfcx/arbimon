import { type AxiosInstance } from 'axios'

export interface RecordingsQueryParams {
  start: string
  end?: string
  site_external_id: string
  project_id?: number
}

export const apiArbimonLegacyFindRecording = async (apiClient: AxiosInstance, slug: string, params: RecordingsQueryParams): Promise<number> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/recordings/query`, { params })
  return Number(response.data)
}
