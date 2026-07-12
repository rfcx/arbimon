import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed } from 'vue'

import { type ProjectCapabilitiesResponse, apiBioGetProjectCapabilities } from '@rfcx-bio/common/api-bio/project/project-capabilities'

export const useGetProjectCapabilities = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<ProjectCapabilitiesResponse | undefined, unknown> => {
  return useQuery({
    queryKey: computed(() => ['fetch-project-capabilities', projectId.value]),
    queryFn: async () => await apiBioGetProjectCapabilities(apiClient, projectId.value ?? -1),
    enabled: computed(() => projectId.value !== undefined)
  })
}
