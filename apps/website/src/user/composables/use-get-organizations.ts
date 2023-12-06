import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type OrganizationsResponse, apiGetOrganizationsList } from '@rfcx-bio/common/api-bio/users/profile'

export const useGetOrganizationsList = (apiClient: AxiosInstance): UseQueryReturnType<OrganizationsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-organizations'],
    queryFn: async () => await apiGetOrganizationsList(apiClient)
  })
}
