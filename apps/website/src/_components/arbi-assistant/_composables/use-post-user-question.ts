import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ArbiResponseData, type ArbiUserQuestionParams, apiPostUserQuestion } from '@rfcx-bio/common/api-arbimon/arbi-assistant'

export const usePostUserQuestion = (apiClient: AxiosInstance): UseMutationReturnType<ArbiResponseData[], unknown, ArbiUserQuestionParams, unknown> => {
  return useMutation({
    mutationKey: ['post-user-question'],
    mutationFn: async (payload: ArbiUserQuestionParams) => { return await apiPostUserQuestion(apiClient, payload) }
  })
}
