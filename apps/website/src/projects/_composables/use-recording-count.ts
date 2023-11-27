import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type SitesRecCountAndDates, apiBioGetProjectRecordingCount, apiBioGetProjectRecordingCountBySite } from '@rfcx-bio/common/api-bio/project/project-recordings'

export const useBioRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<number | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-bio-recording-count', params],
    queryFn: async () => await apiBioGetProjectRecordingCount(apiClient, params?.value ?? 0)
  })
}

export const useBioProjectSitesRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<number | undefined>): UseQueryReturnType<SitesRecCountAndDates[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-bio-project-sites-recording-count', params],
    queryFn: async () => await apiBioGetProjectRecordingCountBySite(apiClient, params?.value ?? 0)
  })
}
