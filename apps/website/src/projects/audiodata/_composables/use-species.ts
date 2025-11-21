import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { type ComputedRef, computed } from 'vue'

import { type ProjectTemplatesResponse, type PublicTemplateResponse, type PublicTemplatesParams, type SongtypeResponse, type SpeciesClassesParams, type SpeciesResponse, type SpeciesSearchResponse, apiArbimonGetProjectTemplates, apiArbimonGetPublicTemplates, apiArbimonGetSpeciesClasses, apiLegacySearchSpecies, songtypesSpecies } from '@rfcx-bio/common/api-arbimon/audiodata/species'

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

export const useGetPublicTemplates = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, params: ComputedRef<PublicTemplatesParams | undefined>): UseQueryReturnType<PublicTemplateResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-public-templates', slug],
    enabled: computed(() => Boolean(slug.value && params.value?.classIds?.length)),
    queryFn: async () => await apiArbimonGetPublicTemplates(apiClient, slug?.value ?? '', params.value ?? { classIds: undefined }),
    refetchOnWindowFocus: false
  })
}

export const useSearchSpecies = (
  apiClient: AxiosInstance,
  q: ComputedRef<string | undefined>
): UseQueryReturnType<SpeciesSearchResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: computed(() => ['species-search', q.value?.trim() ?? '']),
    enabled: computed(() => Boolean(q.value && q.value.trim().length >= 2)),
    queryFn: async () => await apiLegacySearchSpecies(apiClient, q.value?.trim() ?? ''),
    refetchOnWindowFocus: false
  })
}

export const useSongtypesSpecies = (apiClient: AxiosInstance): UseQueryReturnType<SongtypeResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: computed(() => ['songtypes-species']),
    queryFn: async () => await songtypesSpecies(apiClient),
    refetchOnWindowFocus: false
  })
}
