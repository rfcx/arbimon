import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type UpdateUserProfileRequestBody, apiGetUserProfile, apiUpdateUserProfile } from '@rfcx-bio/common/api-bio/users/profile'

export const usePatchUserProfile = (apiClient: AxiosInstance): UseMutationReturnType<void, unknown, UpdateUserProfileRequestBody, unknown> => {
  return useMutation({
    mutationKey: ['patch-user-profile'],
    mutationFn: async (data: UpdateUserProfileRequestBody) => { await apiUpdateUserProfile(apiClient, data) }
  })
}

export const useGetProfileData = (apiClient: AxiosInstance): UseQueryReturnType<UpdateUserProfileRequestBody | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-user-profile'],
    queryFn: async () => await apiGetUserProfile(apiClient)
  })
}
