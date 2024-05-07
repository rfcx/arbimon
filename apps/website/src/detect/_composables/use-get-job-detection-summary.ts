import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type GetClassifierJobInformationResponse, apiBioGetClassifierJobInformation } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetClassifierJobInformation = (apiClient: AxiosInstance, jobId: number, refetchInterval: ComputedRef<number | false>): UseQueryReturnType<GetClassifierJobInformationResponse | undefined, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECT_SUMMARY],
    queryFn: async () => await apiBioGetClassifierJobInformation(apiClient, jobId),
    refetchInterval
  })
}
