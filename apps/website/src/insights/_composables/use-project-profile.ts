import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ProjectProfileResponse, apiBioGetProjectProfileData } from '@rfcx-bio/common/api-bio/project-profile/project-profile'

export const useGetProjectProfile = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<ProjectProfileResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-profile'],
    queryFn: async () => await apiBioGetProjectProfileData(apiClient, projectId),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}
