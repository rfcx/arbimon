import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type RecordingResponse, type RecordingSearchParams, type RecordingTagResponse, type RecordingTagSearchParams, type TagDeleteResponse, type TagParams, type VisobjectResponse, apiArbimonGetRecording, apiArbimonGetRecordings, apiDeleteRecordingTag, apiGetRecordingTag, apiPutRecordingTag, apiSearchTag } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

export const useGetRecording = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, recordingId: ComputedRef<string | undefined>): UseQueryReturnType<VisobjectResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-recording'],
    queryFn: async () => {
      if (!slug.value || !recordingId.value) return undefined
      return await apiArbimonGetRecording(apiClient, slug.value, recordingId.value)
    }
  })
}

export const useGetListRecordings = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, params: ComputedRef<RecordingSearchParams | undefined>): UseQueryReturnType<RecordingResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-recordings'],
    queryFn: async () => {
      if (!slug.value) return undefined
      return await apiArbimonGetRecordings(apiClient, slug.value, params.value ?? {
        limit: 10,
        offset: 0,
        key: ''
      })
    }
  })
}

export const useGetRecordingTag = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, recordingId: ComputedRef<string | undefined>): UseQueryReturnType<RecordingTagResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-recording-tag'],
    queryFn: async () => {
      if (!slug.value || !recordingId.value) return []
      return await apiGetRecordingTag(apiClient, slug.value, recordingId.value)
    }
  })
}

export const useSearchTag = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, params: RecordingTagSearchParams): UseQueryReturnType<RecordingTagResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-search-tag'],
    queryFn: async () => {
      if (!slug.value || !params.q.length) return []
      return await apiSearchTag(apiClient, slug.value, params)
    }
  })
}

export const usePutRecordingTag = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, recordingId: ComputedRef<string | undefined>): UseMutationReturnType<RecordingTagResponse[] | undefined, unknown, TagParams | TagParams[], unknown> => {
  return useMutation({
    mutationKey: ['put-recording-tag'],
    mutationFn: async (payload: TagParams | TagParams[]) => {
      if (!slug.value || !recordingId.value) return undefined
      return await apiPutRecordingTag(apiClient, slug.value, recordingId.value, payload)
    }
  })
}

export const useDeleteRecordingTag = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, recordingId: ComputedRef<string | undefined>): UseMutationReturnType<TagDeleteResponse | undefined, unknown, RecordingTagResponse, unknown> => {
  return useMutation({
    mutationKey: ['delete-recording-tag'],
    mutationFn: async (payload: RecordingTagResponse) => {
      if (!slug.value || !recordingId.value) return undefined
      return await apiDeleteRecordingTag(apiClient, slug.value, recordingId.value, payload)
    }
  })
}
