import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type RecordingCount, apiArbimonGetRecordingCount } from '@rfcx-bio/common/api-arbimon/metrics/recording-count'
import { type SitesRecCountAndDates, apiBioGetProjectRecordingCountBySite } from '@rfcx-bio/common/api-bio/project/project-recordings'

export const useBioProjectSitesRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<number | undefined>): UseQueryReturnType<SitesRecCountAndDates[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-bio-project-sites-recording-count', params],
    queryFn: async () => await apiBioGetProjectRecordingCountBySite(apiClient, params?.value ?? 0)
  })
}

export const useRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<RecordingCount | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-recording-count', params],
    queryFn: async () => await apiArbimonGetRecordingCount(apiClient, params?.value ?? '')
  })
}
