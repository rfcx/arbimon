import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ProjectLocationResponse, apiBioGetProjectLocation } from '@rfcx-bio/common/api-bio/project/project-location'

export const useGetProjectLocation = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>): UseQueryReturnType<ProjectLocationResponse, unknown> => {
  return useQuery(
    ['get-core-project-location', locationProjectId],
    async () => await apiBioGetProjectLocation(apiClient, locationProjectId?.value ?? -1)
  )
}
