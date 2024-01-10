import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type DashboardStakeholdersResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { apiBioDeleteProject } from '@rfcx-bio/common/api-bio/project/project-delete'
import { apiBioUpdateProjectImage } from '@rfcx-bio/common/api-bio/project/project-image'
import { type ProjectInfoResponse, type ProjectProfileUpdateBody, type ProjectSettingsResponse, apiBioGetProjectInfoData, apiBioGetProjectStakeHoldersData, apiBioUpdateProjectSettingsData } from '@rfcx-bio/common/api-bio/project/project-settings'

export const useGetProjectSettings = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<ProjectSettingsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-settings'],
    queryFn: async () => await apiBioGetProjectInfoData(apiClient, projectId.value ?? -1, ['countryCodes', 'image'])
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

export const useUpdateProjectImage = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, unknown, FormData, unknown> => {
  return useMutation({
    mutationKey: ['patch-project-image'],
    mutationFn: async (form: FormData) => { await apiBioUpdateProjectImage(apiClient, projectId, form) }
  })
}

export const useGetProjectInfo = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>, parems: string[]): UseQueryReturnType<ProjectInfoResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-settings'],
    queryFn: async () => await apiBioGetProjectInfoData(apiClient, projectId.value ?? -1, parems)
  })
}

export const useGetProjectStakeholders = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<DashboardStakeholdersResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-stakeholders'],
    queryFn: async () => await apiBioGetProjectStakeHoldersData(apiClient, projectId.value ?? -1)
  })
}

export const useDeleteProject = (apiClient: AxiosInstance): UseMutationReturnType<void, unknown, number, unknown> => {
  return useMutation({
    mutationKey: ['delete-project'],
    mutationFn: async (projectId: number) => { await apiBioDeleteProject(apiClient, projectId) }
  })
}
