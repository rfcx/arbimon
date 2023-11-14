import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ProjectSpeciesAllResponse, type ProjectSpeciesQueryParams, apiBioGetProjectSpeciesAll } from '@rfcx-bio/common/api-bio/species/project-species-all'

export const useSpeciesInProject = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>, params: ProjectSpeciesQueryParams = {}): UseQueryReturnType<ProjectSpeciesAllResponse, unknown> => {
  return useQuery(
    ['get-species-in-project', locationProjectId],
    async () => await apiBioGetProjectSpeciesAll(apiClient, locationProjectId?.value ?? -1, params)
  )
}
