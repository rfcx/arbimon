import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiBioGetValidationStatusData, DetectValidationStatusResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-status'

export const FETCH_VALIDATION_STATUS = 'fetch-validation-status'

export const useGetValidationStatus = (apiClient: AxiosInstance, jobId: number): UseQueryReturnType<DetectValidationStatusResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_VALIDATION_STATUS],
    async () => await apiBioGetValidationStatusData(apiClient, jobId)
  )
}
