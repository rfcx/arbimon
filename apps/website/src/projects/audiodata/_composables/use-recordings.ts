import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { type ComputedRef, computed } from 'vue'

import { type ClassesRecordingResponse, type ClassificationsResponse, type LegacyAvailableResponse, type PlaylistResponse, type RecordingSearchParams, type RecordingSearchResponse, type SoundscapeResponse, type TagResponse, apiArbimonGetClasses, apiArbimonGetClassifications, apiArbimonGetPlaylists, apiArbimonGetRecordings, apiArbimonGetSoundscape, apiArbimonGetTags, apiLegacyGetAvailable } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

export const useRecordings = (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>,
  request: ComputedRef<RecordingSearchParams | undefined>
): UseQueryReturnType<RecordingSearchResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-recordings', slug, request],
    queryFn: async () => {
      if (!slug.value) return undefined
      return await apiArbimonGetRecordings(apiClient, slug.value, request.value ?? {
        limit: 10,
        offset: 0,
        output: ['count', 'date_range', 'list'],
        sortBy: 'r.site_id DESC, r.datetime DESC'
      })
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

export const useGetClasses = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseQueryReturnType<ClassesRecordingResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-classes', slug],
    queryFn: async () => await apiArbimonGetClasses(apiClient, slug?.value ?? ''),
    refetchOnWindowFocus: false
  })
}

export const useGetPlaylists = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseQueryReturnType<PlaylistResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-playlists', slug],
    queryFn: async () => await apiArbimonGetPlaylists(apiClient, slug?.value ?? ''),
    refetchOnWindowFocus: false
  })
}

export const useGetSoundscape = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseQueryReturnType<SoundscapeResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-soundscape', slug],
    queryFn: async () => await apiArbimonGetSoundscape(apiClient, slug?.value ?? ''),
    refetchOnWindowFocus: false
  })
}

export const useGetClassifications = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseQueryReturnType<ClassificationsResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-classifications', slug],
    queryFn: async () => await apiArbimonGetClassifications(apiClient, slug?.value ?? ''),
    refetchOnWindowFocus: false
  })
}

export const useGetTags = (apiClient: AxiosInstance, slug: ComputedRef<string | undefined>): UseQueryReturnType<TagResponse[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-tags', slug],
    queryFn: async () => await apiArbimonGetTags(apiClient, slug?.value ?? ''),
    refetchOnWindowFocus: false
  })
}

export interface LegacyAvailableRecordFormatted {
  date: string // 'YYYY-MM-DD'
  recordedMinutesCount: number
}

export function transformLegacyAvailableResponse (
  raw: LegacyAvailableResponse
): LegacyAvailableRecordFormatted[] {
  const out: LegacyAvailableRecordFormatted[] = []

  for (const projectName of Object.keys(raw)) {
    const years = raw[projectName]
    for (const year of Object.keys(years)) {
      const months = years[year]
      for (const month of Object.keys(months)) {
        const days = months[month]
        for (const day of Object.keys(days)) {
          const count = days[day]
          const date = dayjs(`${year}-${month}-${day}`, 'YYYY-M-D', true).format('YYYY-MM-DD')
          out.push({ date, recordedMinutesCount: count })
        }
      }
    }
  }

  out.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
  return out
}

export const useLegacyGetAvailable = (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>,
  siteId: ComputedRef<string | number | undefined>,
  year: ComputedRef<string | number | undefined>
): UseQueryReturnType<LegacyAvailableResponse | undefined, unknown> => {
  const enabled = computed(() => Boolean((slug.value ?? '') !== '' && siteId.value !== undefined && siteId.value !== null && year.value !== undefined && year.value !== null))

  return useQuery({
    queryKey: ['legacy-available', slug, siteId, year],
    queryFn: async () =>
      await apiLegacyGetAvailable(
        apiClient,
        slug.value ?? '',
        siteId.value ?? '',
        year.value ?? ''
      ),
    enabled,
    refetchOnWindowFocus: false
  })
}

export function useLegacyAvailableBySiteYear (
  apiClient: AxiosInstance,
  slug: ComputedRef<string | undefined>,
  siteId: ComputedRef<string | number | undefined>,
  year: ComputedRef<string | number | undefined>,
  monthFrom: ComputedRef<number> = computed(() => 1),
  monthTo: ComputedRef<number> = computed(() => 12)
): UseQueryReturnType<LegacyAvailableRecordFormatted[] | undefined, unknown> {
  const enabled = computed(() => Boolean(slug.value && siteId.value != null && year.value != null))

  return useQuery({
    queryKey: ['legacy-available', slug, siteId, year, monthFrom, monthTo],
    queryFn: async () => {
      const raw: LegacyAvailableResponse | undefined = await apiLegacyGetAvailable(
        apiClient,
        slug.value ?? '',
        siteId.value ?? '',
        year.value ?? ''
      )
      if (raw == null) return undefined
      return transformLegacyAvailableResponse(raw)
    },
    enabled,
    refetchOnWindowFocus: false
  })
}
