import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type ProjectProfileUpdateBody, type ProjectSettingsResponse, apiBioGetProjectSettingsData, apiBioUpdateProjectSettingsData } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

export const useGetProjectSettings = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<ProjectSettingsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-settings'],
    queryFn: async () => await apiBioGetProjectSettingsData(apiClient, projectId.value ?? -1)
  })
}

export const useUpdateProjectSettings = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<ProjectSettingsResponse | undefined, unknown, ProjectProfileUpdateBody, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-project-settings'],
    mutationFn: async (settings: ProjectProfileUpdateBody) => {
      return await apiBioUpdateProjectSettingsData(apiClient, projectId, settings)
    }
  })
}
