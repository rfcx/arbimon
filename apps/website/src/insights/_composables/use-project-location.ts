import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type ProjectLocationResponse, apiBioGetProjectLocation } from '@rfcx-bio/common/api-bio/project/project-location'

export const useGetProjectLocation = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>): UseQueryReturnType<ProjectLocationResponse, unknown> => {
  return useQuery({
    queryKey: ['get-core-project-location', locationProjectId],
    queryFn: async () => await apiBioGetProjectLocation(apiClient, locationProjectId?.value ?? -1)
  })
}
