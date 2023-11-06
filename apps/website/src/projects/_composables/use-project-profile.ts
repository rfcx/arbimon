import { type AxiosInstance } from 'axios'
import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from 'vue-query'

import { type ProjectProfileResponse, type ProjectProfileUpdateBody, apiBioGetProjectProfileData, apiBioUpdateProjectProfileData } from '@rfcx-bio/common/api-bio/project-profile/project-profile'
import { type ProjectSettingsResponse, type ProjectSettingsUpdateBody, apiBioGetProjectSettingsData, apiBioUpdateProjectSettingsData } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

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

export const useGetProjectSettings = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<ProjectSettingsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-settings'],
    queryFn: async () => await apiBioGetProjectSettingsData(apiClient, projectId)
  })
}

export const useUpdateProjectSettings = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<ProjectSettingsResponse | undefined, unknown, ProjectSettingsUpdateBody, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-project-settings'],
    mutationFn: async (settings: ProjectSettingsUpdateBody) => {
      const { name, summary, objectives } = settings
      return await apiBioUpdateProjectSettingsData(apiClient, projectId, { name, summary, objectives })
    }
  })
}
