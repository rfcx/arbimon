import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { type AddNewTrainingSetParams, type AddNewTrainingSetResponse, type CreateTrainingSetParams, type CreateTrainingSetResponse, type RecordingTrainingSet, type RecordingTrainingSetParams, type TrainingSet, apiGetRecordingTrainingSets, apiGetTrainingSets, apiPostNewTrainingSet, apiPostTrainingSet } from '@rfcx-bio/common/api-arbimon/audiodata/training-sets'

export function useGetTrainingSets (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>
): UseQueryReturnType<TrainingSet[] | undefined, unknown> {
  const enabled = computed(() => Boolean(slug.value))

  return useQuery({
    queryKey: ['get-training-sets', slug],
    queryFn: async () => {
      const data = await apiGetTrainingSets(apiClient, slug.value ?? '')
      return data
    },
    enabled,
    refetchOnWindowFocus: false
  })
}

export function useGetRecordingTrainingSets (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, params: ComputedRef<RecordingTrainingSetParams>): UseQueryReturnType<RecordingTrainingSet[] | undefined, unknown> {
  const enabled = computed(() => Boolean(slug.value))

  return useQuery({
    queryKey: ['get-recording-training-sets', slug],
    queryFn: async () => {
      if (!slug.value || params.value.trainingSetId === '' || params.value.recordingId === '') return []
      const data = await apiGetRecordingTrainingSets(apiClient, slug.value ?? '', params.value.trainingSetId, params.value.recordingId)
      return data
    },
    retry: 0,
    enabled,
    refetchOnWindowFocus: false
  })
}

export const usePostTrainingSet = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseMutationReturnType<CreateTrainingSetResponse | undefined, unknown, CreateTrainingSetParams, unknown> => {
  return useMutation({
    mutationKey: ['post-training-set'],
    mutationFn: async (payload: CreateTrainingSetParams) => {
      if (!slug.value) return undefined
      return await apiPostTrainingSet(apiClient, slug.value, payload)
    }
  })
}

export const usePostNewTrainingSet = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseMutationReturnType<AddNewTrainingSetResponse | undefined, unknown, AddNewTrainingSetParams, unknown> => {
  return useMutation({
    mutationKey: ['post-new-training-set'],
    mutationFn: async (payload: AddNewTrainingSetParams) => {
      if (!slug.value) return undefined
      return await apiPostNewTrainingSet(apiClient, slug.value, payload)
    }
  })
}
