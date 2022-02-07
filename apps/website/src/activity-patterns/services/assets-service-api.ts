import { coreMediaUrl } from '@rfcx-bio/common/api-bio/media/core-media'

import { apiClient } from '~/api'

export class AssetsService {
  constructor (private readonly baseUrl: string) {}

  async getMedia (mediaUrl: string): Promise<string | undefined> {
    const url = `${this.baseUrl}${coreMediaUrl()}?url=${mediaUrl}`
    const response = await apiClient.getOrUndefined<string>(url)
    return response
  }
}
