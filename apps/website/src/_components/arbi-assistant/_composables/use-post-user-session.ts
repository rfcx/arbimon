import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ArbiSessionData, apiGetArbiSession } from '@rfcx-bio/common/api-arbimon/arbi-assistant'

export const usePostUserSession = (apiClient: AxiosInstance): UseMutationReturnType<ArbiSessionData, unknown, string, unknown> => {
  return useMutation({
    mutationKey: ['post-user-session'],
    mutationFn: async (userId: string) => { return await apiGetArbiSession(apiClient, userId) },
    retry: 3,
    retryDelay: 5000
  })
}
