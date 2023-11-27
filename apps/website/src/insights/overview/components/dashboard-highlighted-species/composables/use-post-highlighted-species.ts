import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type SpeciesHighlightedBody, apiBioDeleteSpecieHighlighted, apiBioPostSpeciesHighlighted } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

export const usePostSpeciesHighlighted = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>): UseMutationReturnType<void, unknown, SpeciesHighlightedBody, unknown> => {
  return useMutation({
    mutationKey: ['post-species-highlighted'],
    mutationFn: async (payload: SpeciesHighlightedBody) => { await apiBioPostSpeciesHighlighted(apiClient, locationProjectId.value ?? -1, payload) }
  })
}

export const useDeleteSpecieHighlighted = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>): UseMutationReturnType<void, unknown, SpeciesHighlightedBody, unknown> => {
  return useMutation({
    mutationKey: ['delete-specie-highlighted'],
    mutationFn: async (payload: SpeciesHighlightedBody) => { await apiBioDeleteSpecieHighlighted(apiClient, locationProjectId.value ?? -1, payload) }
  })
}
