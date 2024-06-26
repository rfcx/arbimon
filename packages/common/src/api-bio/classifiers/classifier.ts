import { type AxiosInstance } from 'axios'

// Request type
export interface ClassifierQueryParams {
  fields?: string[]
}

export interface ClassifierParams {
  classifierId: string
}

// Response type
export interface ClassifierResponse {
  // Base response, but won't be attached back once `fields[]` query params are given.
  id?: number
  name?: string
  version?: number
  lastExecutedAt?: string | null

  // These two are also part of base response and will be for all responses.
  isPublic: boolean
  createdById: number

  // Enabled by passing these key in snake_case into parameter `fields[]`.
  // When `fields[]` are passed. All other responses not in `fields[]` except `isPublic` and `createdById` won't be returned.
  externalId?: string | null
  modelRunner?: string
  modelUrl?: string
  parameters?: string

  deployments?: Array<{
    id: number
    deployed: boolean
    status: number
    // ISO 8601 datetime string
    start: string
    // ISO 8601 datetime string
    end: string
  }>

  outputs?: Array<{
    classificationId: number
    classifierId: number
    outputClassName: string
    ignoreThreshold: number
    classification: {
      value: string
      title: string
      image: string | null
    }
  }>

  createdBy?: Array<{
    firstname: string | null
    lastname: string | null
    email: string | null
    picture: string | null
  }>

  activeStreams?: Array<{
    id: string
    name: string
    // ISO 8601 datetime string
    start: string | null
    // ISO 8601 datetime string
    end: string | null
    latitude: number | null
    longitude: number | null
    altitude: number | null
    isPublic: boolean
  }>
}

// Route
export const classifierRoute = '/classifiers/:classifierId'

// Service
export const apiBioGetClassifier = async (apiClient: AxiosInstance, params: ClassifierParams, query: ClassifierQueryParams): Promise<ClassifierResponse> => {
  const response = await apiClient.request<ClassifierResponse>({
    method: 'GET',
    url: `/classifiers/${params.classifierId}`,
    params: query
  })

  return response.data
}
