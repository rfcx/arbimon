import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type Ref, computed } from 'vue'

import { type LegacyProjectTieringUsage, apiArbimonGetProjectTieringUsage } from '@rfcx-bio/common/api-arbimon/project-tiering-usage'

export const useProjectTieringUsage = (apiClient: AxiosInstance, slug: Ref<string>): UseQueryReturnType<LegacyProjectTieringUsage, unknown> => {
  return useQuery({
    queryKey: ['project-tiering-usage', slug],
    queryFn: async () => await apiArbimonGetProjectTieringUsage(apiClient, slug.value),
    enabled: computed(() => slug.value !== ''),
    staleTime: 1000
  })
}
