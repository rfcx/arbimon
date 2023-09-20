import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ProjectSpeciesAllResponse, apiBioGetProjectSpeciesAll } from '@rfcx-bio/common/api-bio/species/project-species-all'

export const useGetAllSpeciesInProject = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<ProjectSpeciesAllResponse, unknown> => {
  return useQuery({
    queryKey: 'get-all-species-in-project',
    queryFn: async () => await apiBioGetProjectSpeciesAll(apiClient, projectId)
  })
}
