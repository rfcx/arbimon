import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request types
export interface CoreMediaQuery {
  url: string
}

// Route
export const coreMediaRoute = '/core-media'

// Service
export const apiBioGetCoreMedia = async (apiClient: AxiosInstance, mediaUrl: string): Promise<Blob | undefined> => {
  const url = `/core-media?${new URLSearchParams(mediaUrl).toString()}`
  return await apiGetOrUndefined(apiClient, url, { responseType: 'blob' })
}
