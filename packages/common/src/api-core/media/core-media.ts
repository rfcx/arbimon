import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request types
export interface CoreMediaParams {
  filename: string
}

// Route
export const coreMediaRoute = '/internal/assets/streams'

// Service
export const apiCoreGetMedia = async (apiClient: AxiosInstance, params: CoreMediaParams): Promise<Blob | undefined> => {
  return await apiGetOrUndefined(apiClient, `${coreMediaRoute}/${params.filename}`, { responseType: 'blob' })
}
