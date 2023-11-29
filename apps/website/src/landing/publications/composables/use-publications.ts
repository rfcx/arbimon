import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type LandingPublicationsResponse, apiBioGetLandingPublications } from '@rfcx-bio/common/api-bio/landing/landing-publications'

export const usePublications = (apiClient: AxiosInstance): UseQueryReturnType<LandingPublicationsResponse, unknown> => {
  return useQuery({
    queryKey: ['fetch-publications'],
    queryFn: async () => await apiBioGetLandingPublications(apiClient)
  })
}
