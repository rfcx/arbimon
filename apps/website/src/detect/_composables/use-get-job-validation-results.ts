import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type DetectValidationResultsQueryParams, type DetectValidationResultsResponse, apiBioGetValidationResults } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'

export const FETCH_VALIDATION_STATUS = 'fetch-validation-status'

export const useGetJobValidationResults = (apiClient: AxiosInstance, jobId: number, query: DetectValidationResultsQueryParams): UseQueryReturnType<DetectValidationResultsResponse, unknown> => {
  return useQuery({
    queryKey: [FETCH_VALIDATION_STATUS],
    queryFn: async () => await apiBioGetValidationResults(apiClient, jobId, query),
    // refetch every 1 minute
    refetchInterval: 60_000
  })
}
