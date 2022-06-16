import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request types
export interface CoreMediaQuery {
  url: string
}

// Route
export const coreMediaRoute = '/core-media'

// Service
export const apiBioGetCoreMedia = async (apiClient: AxiosInstance, url: string): Promise<Blob | undefined> => {
  const params = new URLSearchParams({ url })
  const route = `/core-media?${params.toString()}`
  return await apiGetOrUndefined(apiClient, route, { responseType: 'blob' })
}
