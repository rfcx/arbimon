import { AxiosInstance } from 'axios'

import { coreMediaUrl } from '@rfcx-bio/common/api-bio/media/core-media'
import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

export const getMedia = async (apiClient: AxiosInstance, mediaUrl: string): Promise<Blob|undefined> =>
  await apiGetOrUndefined<Blob>(apiClient, `${coreMediaUrl()}?url=${mediaUrl}`, { responseType: 'blob' })

export const getPredictedOccupancyMapImage = async (apiClient: AxiosInstance, url: string): Promise<Blob|undefined> =>
  await apiGetOrUndefined<Blob>(apiClient, url, { responseType: 'blob' })
