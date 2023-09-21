import { type AxiosInstance } from 'axios'

import { type DetectRouteParamsSerialized, DETECT_SPECIFIC_ROUTE_PREFIX, detectSpecificRoutePrefix } from '../_helpers/detect-specific-route'

// Request type
export type DetectValidationResultsParams = DetectRouteParamsSerialized

export interface DetectValidationResultsQueryParams {
  fields: string[]
}

/**
 * Response type
 *
 * Do note that the response will come out in this shape only when
 * `fields` query param is set to `[classifications_summary]`
 */
export interface DetectValidationResultsResponse {
  reviewStatus: {
    total: number
    rejected: number
    uncertain: number
    confirmed: number
  }
  classificationsSummary: Array<{
    value: string
    title: string
    image: string | null
    total: number
    rejected: number
    uncertain: number
    confirmed: number
  }>
}

// Route
export const detectValidationResultsRoute = `${DETECT_SPECIFIC_ROUTE_PREFIX}/results`

// Service
export const apiBioGetValidationResults = async (apiClient: AxiosInstance, jobId: number, query: DetectValidationResultsQueryParams): Promise<DetectValidationResultsResponse> => {
  const response = await apiClient.get(detectSpecificRoutePrefix(jobId) + '/results', { params: query })
  return response.data
}
