import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ProjectSpeciesOneResponse, apiBioGetProjectSpeciesOne } from '@rfcx-bio/common/api-bio/species/project-species-one'

export const useGetOneSpeciesInformation = (apiClient: AxiosInstance, projectId: number, slug: string, enabled: ComputedRef<boolean>): UseQueryReturnType<ProjectSpeciesOneResponse, unknown> => {
  return useQuery({
    queryKey: 'get-one-species-information',
    queryFn: async () => await apiBioGetProjectSpeciesOne(apiClient, projectId, slug),
    enabled
  })
}
