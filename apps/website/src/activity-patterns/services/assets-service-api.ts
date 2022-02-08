import { coreMediaUrl } from '@rfcx-bio/common/api-bio/media/core-media'

import { apiClient } from '~/api'

export class AssetsService {
  constructor (private readonly baseUrl: string) {}

  async getMedia (mediaUrl: string): Promise<Blob | undefined> {
    const url = `${this.baseUrl}${coreMediaUrl()}?url=${mediaUrl}`
    const response = await apiClient.getOrUndefined<Blob>(url, { responseType: 'blob' })
    return response
  }
}
