import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type RecordingSearchParams, type RecordingSearchResponse, apiArbimonGetRecordings } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

export const useRecordings = (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>,
  request: ComputedRef<RecordingSearchParams | undefined>
): UseQueryReturnType<RecordingSearchResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-recordings', slug, request],
    queryFn: async () => {
      if (!slug.value) return undefined
      return await apiArbimonGetRecordings(apiClient, slug.value, request.value ?? {
        limit: 10,
        offset: 0,
        output: ['count', 'date_range', 'list'],
        sortBy: 'r.site_id DESC, r.datetime DESC'
      })
    }
  })
}
