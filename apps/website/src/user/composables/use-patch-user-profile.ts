import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type UpdateUserProfileRequestBody, apiUpdateUserProfile } from '@rfcx-bio/common/api-bio/users/profile'

export const usePatchUserProfile = (apiClient: AxiosInstance): UseMutationReturnType<void, unknown, UpdateUserProfileRequestBody, unknown> => {
  return useMutation({
    mutationKey: ['patch-user-profile'],
    mutationFn: async (data: UpdateUserProfileRequestBody) => { await apiUpdateUserProfile(apiClient, data) }
  })
}
