import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type SpeciesClassesParams, type SpeciesResponse, apiArbimonGetSpeciesClasses } from '@rfcx-bio/common/api-arbimon/audiodata/species'

export const useGetSpecies = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, params: SpeciesClassesParams): UseQueryReturnType<SpeciesResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-species classes', slug],
    queryFn: async () => await apiArbimonGetSpeciesClasses(apiClient, slug?.value ?? '', params),
    refetchOnWindowFocus: false
  })
}
