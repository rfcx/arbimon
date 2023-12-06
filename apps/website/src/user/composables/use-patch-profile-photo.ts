import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { apiPatchProfileImage } from '@rfcx-bio/common/api-bio/users/profile-image'

export const usePatchProfileImage = (apiClient: AxiosInstance): UseMutationReturnType<void, unknown, FormData, unknown> => {
  return useMutation({
    mutationKey: ['patch-profile-image'],
    mutationFn: async (form: FormData) => { await apiPatchProfileImage(apiClient, form) }
  })
}
