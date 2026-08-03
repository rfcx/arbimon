import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type PortfolioSummaryResponse, apiGetPortfolioSummary } from '@rfcx-bio/common/api-bio/users/tiering'

export const useGetPortfolioSummary = (apiClient: AxiosInstance): UseQueryReturnType<PortfolioSummaryResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-portfolio-summary'],
    queryFn: async () => await apiGetPortfolioSummary(apiClient)
  })
}
