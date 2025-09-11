import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type ProjectTemplatesResponse, type SpeciesClassesParams, type SpeciesResponse, apiArbimonGetProjectTemplates, apiArbimonGetSpeciesClasses } from '@rfcx-bio/common/api-arbimon/audiodata/species'

export const useGetSpecies = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, params: ComputedRef<SpeciesClassesParams | undefined>): UseQueryReturnType<SpeciesResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-species-classes', slug],
    queryFn: async () => await apiArbimonGetSpeciesClasses(apiClient, slug?.value ?? '', params.value ?? {
        limit: 10,
        offset: 0,
        q: ''
      }),
    refetchOnWindowFocus: false
  })
}

export const useGetProjectTemplates = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseQueryReturnType<ProjectTemplatesResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-project-templates', slug],
    queryFn: async () => await apiArbimonGetProjectTemplates(apiClient, slug?.value ?? ''),
    refetchOnWindowFocus: false
  })
}
