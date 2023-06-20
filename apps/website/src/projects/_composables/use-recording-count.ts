import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type RecordingCountParams, apiArbimonGetRecordingCount } from '@rfcx-bio/common/api-arbimon/metrics/recording-count'

export const useRecordingCount = (apiClient: AxiosInstance, params: RecordingCountParams): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-recording-count'],
    async () => await apiArbimonGetRecordingCount(apiClient, params)
  )
}
