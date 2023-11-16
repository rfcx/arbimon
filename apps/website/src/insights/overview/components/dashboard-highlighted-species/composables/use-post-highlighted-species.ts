import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseMutationReturnType, useMutation } from 'vue-query'

import { type SpeciesHighlightedBody, apiBioDeleteSpecieHighlighted, apiBioPostSpeciesHighlighted } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

export const usePostSpeciesHighlighted = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>): UseMutationReturnType<void, unknown, SpeciesHighlightedBody, unknown> => {
  return useMutation(
    ['post-species-highlighted'],
    async (payload: SpeciesHighlightedBody) => { await apiBioPostSpeciesHighlighted(apiClient, locationProjectId.value ?? -1, payload) }
  )
}

export const useDeleteSpecieHighlighted = (apiClient: AxiosInstance, locationProjectId: ComputedRef<number | undefined>): UseMutationReturnType<void, unknown, SpeciesHighlightedBody, unknown> => {
  return useMutation(
    ['delete-specie-highlighted'],
    async (payload: SpeciesHighlightedBody) => { await apiBioDeleteSpecieHighlighted(apiClient, locationProjectId.value ?? -1, payload) }
  )
}
