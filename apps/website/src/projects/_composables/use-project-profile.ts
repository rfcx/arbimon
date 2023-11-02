import { type AxiosInstance } from 'axios'
import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from 'vue-query'

import { type ProjectProfileResponse, type ProjectProfileUpdateBody, apiBioGetProjectProfileData, apiBioUpdateProjectProfileData } from '@rfcx-bio/common/api-bio/project-profile/project-profile'

export const useGetProjectProfile = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<ProjectProfileResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-profile'],
    queryFn: async () => await apiBioGetProjectProfileData(apiClient, projectId),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export const useUpdateProjectProfile = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<ProjectProfileResponse | undefined, unknown, ProjectProfileUpdateBody, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-project-profile'],
    mutationFn: async (projectProfile: ProjectProfileUpdateBody) => {
      const { summary, objectives } = projectProfile
      return await apiBioUpdateProjectProfileData(apiClient, projectId, { summary, objectives })
    }
  })
}
