import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiBioGetProjectDetectionCount } from '@rfcx-bio/common/api-bio/project/project-filters'

export const useBioDetectionCount = (apiClient: AxiosInstance, params: ComputedRef<number | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-bio-detecttion-count', params],
    async () => await apiBioGetProjectDetectionCount(apiClient, params?.value ?? 0)
  )
}
