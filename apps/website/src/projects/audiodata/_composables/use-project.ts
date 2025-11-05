import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { type LegacyTrainingSet, apiLegacyGetTrainingSets } from '@rfcx-bio/common/api-arbimon/audiodata/project'

export function useLegacyTrainingSets (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>
): UseQueryReturnType<LegacyTrainingSet[] | undefined, unknown> {
  const enabled = computed(() => Boolean(slug.value))

  return useQuery({
    queryKey: ['legacy-training-sets', slug],
    queryFn: async () => {
      const data = await apiLegacyGetTrainingSets(apiClient, slug.value ?? '')
      return data
    },
    enabled,
    refetchOnWindowFocus: false
  })
}
