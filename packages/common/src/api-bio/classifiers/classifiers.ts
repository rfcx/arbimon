import { type AxiosInstance } from 'axios'

// Request types
export interface GetClassifiersQueryParams {
  limit?: number
  offset?: number
  /**
   * A sort string in the format of comma-separated string with optional negative sign `-`
   * in the front to denote sorting descendingly by that column.
   *
   * The default sorting being `name,-version`. Meaning sort by `name` ascendingly,
   * then sort by `version` descendingly.
   */
  sort?: string
}

// Response types
export interface Classifier {
  id: number
  name: string
  version: number
}

export type GetClassifiersResponse = Classifier[]

// Route
export const getClassifiersRoute = '/classifiers'

// Service
export const apiBioGetClassifiers = async (apiClient: AxiosInstance, params: GetClassifiersQueryParams): Promise<GetClassifiersResponse> => {
  const response = await apiClient.get('/classifiers', { params })
  return response.data
}
