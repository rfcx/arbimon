import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type PortfolioSummaryResponse, type SubmitTierChangeRequestBody, type SubmitTierChangeResponse, apiGetPortfolioSummary, apiPostTierChange } from '@rfcx-bio/common/api-bio/users/tiering'

export const useGetPortfolioSummary = (apiClient: AxiosInstance): UseQueryReturnType<PortfolioSummaryResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-portfolio-summary'],
    queryFn: async () => await apiGetPortfolioSummary(apiClient)
  })
}

export const usePostTierChange = (apiClient: AxiosInstance): UseMutationReturnType<SubmitTierChangeResponse, unknown, SubmitTierChangeRequestBody, unknown> => {
  return useMutation({
    mutationKey: ['post-tier-change'],
    mutationFn: async (body: SubmitTierChangeRequestBody) => await apiPostTierChange(apiClient, body)
  })
}
