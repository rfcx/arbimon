import { type AxiosInstance } from 'axios'

export interface ClassifierJobCreateConfiguration {
  classifierId: number
  projectIdCore: string | null
  queryStreams: string | null
  queryStart: string | null
  queryEnd: string | null
  queryHours: string | null
}

// Request types
export interface ClassifierJobCreateConfigurationParams {
  classifier_id: number
  project_id: string
  query_streams?: string
  query_start?: string
  query_end?: string
  query_hours?: string
}

// Response types
export interface ClassifierJobCreateResponse {
  jobId: number
}

// Service
export const apiCorePostClassifierJobCreate = async (apiClient: AxiosInstance, payload: ClassifierJobCreateConfigurationParams): Promise<ClassifierJobCreateResponse> => {
  const res = await apiClient.post('/classifier-jobs', payload)
  if (res.status !== 201 || !res.headers.location) throw new Error(`Unexpected status code or location header: ${res.status} ${res.headers.location}`)

  const regexResult = /\/classifier-jobs\/(\w+)$/.exec(res.headers.location)
  if (!regexResult) throw new Error(`Unable to parse location header: ${res.headers.location}`)
  return { jobId: Number(regexResult[1]) }
}
