import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiBioGetProjectRecordingCount } from '@rfcx-bio/common/api-bio/project/project-filters'

export const useBioRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<number | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-bio-recording-count', params],
    async () => await apiBioGetProjectRecordingCount(apiClient, params?.value ?? 0)
  )
}
