import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type GeoProjectLocationResponse, apiGeoGetProjectLocation } from '@rfcx-bio/common/api-geo'

export const useGetProjectLocation = (apiClient: AxiosInstance, lat: ComputedRef<number | undefined>, long: ComputedRef<number | undefined>): UseQueryReturnType<GeoProjectLocationResponse, unknown> => {
  return useQuery({
    queryKey: ['get-geo-project-location'],
    queryFn: async () => await apiGeoGetProjectLocation(apiClient, lat?.value, long?.value)
  })
}
