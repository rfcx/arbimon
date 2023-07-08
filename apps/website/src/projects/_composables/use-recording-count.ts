import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetRecordingCount } from '@rfcx-bio/common/api-arbimon/metrics/recording-count'

export const useRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-recording-count', params],
    async () => await apiArbimonGetRecordingCount(apiClient, params?.value ?? '')
  )
}
