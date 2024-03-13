import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type ProjectSpeciesQueryParams, type ProjectSpeciesResponse, apiBioGetProjectSpecies } from '@rfcx-bio/common/api-bio/species/project-species-all'

export const useSpeciesInProject = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>, params: ProjectSpeciesQueryParams = {}): UseQueryReturnType<ProjectSpeciesResponse, unknown> => {
  return useQuery({
    queryKey: ['get-species-in-project', locationProjectId],
    queryFn: async () => await apiBioGetProjectSpecies(apiClient, locationProjectId?.value ?? -1, params)
  })
}
