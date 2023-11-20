import { type AxiosInstance } from 'axios'
import { type Ref } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type SearchOrganizationsResponse, apiBioGetSearchOrganizationsResult } from '@rfcx-bio/common/api-bio/organizations/search-organizations'

export const useGetSearchOrganizationsResult = (apiClient: AxiosInstance, q: Ref<string>): UseQueryReturnType<SearchOrganizationsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-search-organizations-result'],
    queryFn: async () => await apiBioGetSearchOrganizationsResult(apiClient, q.value, '10', '0')
  })
}
