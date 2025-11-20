import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { type ComputedRef, computed } from 'vue'

import { type AedClusterResponse, type newTemplateResponse, type PlaylistInfo, type RecordingPatternMatchingBoxesParams, type RecordingPatternMatchingBoxesResponse, type RecordingResponse, type RecordingSearchParams, type RecordingTagResponse, type RecordingTagSearchParams, type RecordingValidateParams, type RecordingValidateResponse, type SoundscapeCompositionParams, type SoundscapeCompositionResponse, type TagDeleteResponse, type TagParams, type TemplateParams, type TemplateResponse, type VisobjectResponse, apiArbimonGetAedClustering, apiArbimonGetPlaylistInfo, apiArbimonGetRecording, apiArbimonGetRecordings, apiDeleteRecordingTag, apiGetPatternMatchingBoxes, apiGetRecordingTag, apiGetTemplates, apiPostSoundscapeComposition, apiPostTemplate, apiPutRecordingTag, apiRecordingValidate, apiSearchTag } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

export const useGetRecording = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, recordingId: ComputedRef<string | undefined>): UseQueryReturnType<VisobjectResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-recording'],
    queryFn: async () => {
      if (slug.value === undefined || recordingId.value === undefined || recordingId.value === '') return undefined
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

export const useGetPatternMatchingBoxes = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, params: RecordingPatternMatchingBoxesParams): UseQueryReturnType<RecordingPatternMatchingBoxesResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-pm-box'],
    queryFn: async () => {
      if (!slug.value || params.rec_id === undefined) return []
      return await apiGetPatternMatchingBoxes(apiClient, slug.value, params)
    }
  })
}

export const useGetTemplates = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseQueryReturnType<TemplateResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-template'],
    queryFn: async () => {
      if (!slug.value) return []
      return await apiGetTemplates(apiClient, slug.value)
    }
  })
}

export const usePostTemplate = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseMutationReturnType<newTemplateResponse[] | undefined, unknown, TemplateParams, unknown> => {
  return useMutation({
    mutationKey: ['post-template'],
    mutationFn: async (payload: TemplateParams) => {
      if (!slug.value) return undefined
      return await apiPostTemplate(apiClient, slug.value, payload)
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

export const useRecordingValidate = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, recordingId: number): UseMutationReturnType<RecordingValidateResponse[] | undefined, unknown, RecordingValidateParams, unknown> => {
  return useMutation({
    mutationKey: ['post-recording-validate'],
    mutationFn: async (payload: RecordingValidateParams) => {
      if (!slug.value || !recordingId) return undefined
      return await apiRecordingValidate(apiClient, slug.value, recordingId, payload)
    }
  })
}

export const usePostSoundscapeComposition = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>, recordingId: string): UseMutationReturnType<SoundscapeCompositionResponse[] | undefined, unknown, SoundscapeCompositionParams, unknown> => {
  return useMutation({
    mutationKey: ['post-soundscape-composition'],
    mutationFn: async (payload: SoundscapeCompositionParams) => {
      if (!slug.value || !recordingId) return undefined
      return await apiPostSoundscapeComposition(apiClient, slug.value, recordingId, payload)
    }
  })
}

export const useAedClustering = (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>,
  recId: ComputedRef<string | number> | undefined,
  completed: ComputedRef<boolean> = computed(() => true)
): UseQueryReturnType<AedClusterResponse | undefined, unknown> => {
  const enabled = computed(() => Boolean(slug.value && recId?.value !== undefined && recId.value !== null && recId.value !== ''))
  return useQuery({
    queryKey: ['get-aed-clustering', slug, recId, completed],
    queryFn: async () => {
      if (!enabled.value) return undefined
      const raw: AedClusterResponse | undefined = await apiArbimonGetAedClustering(
        apiClient,
        slug.value ?? '',
        recId?.value ?? 0,
        completed.value
      )
      return raw
    },
    enabled,
    refetchOnWindowFocus: false
  })
}

export const useGetPlaylistInfo = (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>,
  playlistId: ComputedRef<string | number | undefined>
): UseQueryReturnType<PlaylistInfo | undefined, unknown> => {
  const enabled = computed(() => Boolean(slug.value && playlistId?.value))

  return useQuery({
    queryKey: ['playlist-info', slug, playlistId],
    queryFn: async () => {
      if (!enabled.value) return undefined
      return await apiArbimonGetPlaylistInfo(apiClient, slug.value ?? '', playlistId?.value ?? 0)
    },
    enabled,
    refetchOnWindowFocus: false
  })
}
