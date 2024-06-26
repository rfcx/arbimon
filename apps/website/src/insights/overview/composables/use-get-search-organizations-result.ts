import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type Ref } from 'vue'

import { type SearchOrganizationsResponse, apiBioGetRecommendedOrganizations, apiBioGetSearchOrganizationsResult } from '@rfcx-bio/common/api-bio/organizations/search-organizations'

export const useGetSearchOrganizationsResult = (apiClient: AxiosInstance, q: Ref<string>): UseQueryReturnType<SearchOrganizationsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-search-organizations-result'],
    queryFn: async () => await apiBioGetSearchOrganizationsResult(apiClient, q.value, '10', '0')
  })
}

export const useGetRecommendedOrganizations = (apiClient: AxiosInstance, userIds: number[]): UseQueryReturnType<SearchOrganizationsResponse, unknown> => {
  return useQuery({
    queryKey: ['fetch-recommended-organizations', { userIds }],
    queryFn: async () => await apiBioGetRecommendedOrganizations(apiClient, { userIds })
  })
}
