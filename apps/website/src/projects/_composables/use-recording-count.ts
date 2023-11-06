import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type SitesRecCountAndDates, apiBioGetProjectRecordingCount, apiBioGetProjectRecordingCountBySite } from '@rfcx-bio/common/api-bio/project/project-recordings'

export const useBioRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<number | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-bio-recording-count', params],
    async () => await apiBioGetProjectRecordingCount(apiClient, params?.value ?? 0)
  )
}

export const useBioProjectSitesRecordingCount = (apiClient: AxiosInstance, params: ComputedRef<number | undefined>): UseQueryReturnType<SitesRecCountAndDates[] | undefined, unknown> => {
  return useQuery(
    ['fetch-bio-project-sites-recording-count', params],
    async () => await apiBioGetProjectRecordingCountBySite(apiClient, params?.value ?? 0)
  )
}
