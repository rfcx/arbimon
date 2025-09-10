import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type GetRecordedMinutesPerDayResponse, apiBioGetRecordedMinutesPerDayRoute } from '@rfcx-bio/common/api-bio/cnn/recorded-minutes-per-day'

export const FETCH_RECODED_MINUTES_PER_DAY = 'fetch-recorded-minutes-per-day'

export const useGetRecordedMinutesPerDay = (apiClient: AxiosInstance, projectId: string): UseQueryReturnType<GetRecordedMinutesPerDayResponse | undefined, unknown> => {
  return useQuery({
    queryKey: [FETCH_RECODED_MINUTES_PER_DAY, projectId],
    queryFn: async () => await apiBioGetRecordedMinutesPerDayRoute(apiClient, projectId)
  })
}
