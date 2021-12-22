import { apiClient } from '~/api'

export class AssetsService {
  async getAudio (url: string): Promise<Blob | undefined> {
    return await apiClient.getOrUndefined<Blob>(url, { responseType: 'blob' })
  }

  async getSpectrogramImage (url: string): Promise<Blob | undefined> {
    return await apiClient.getOrUndefined<Blob>(url, { responseType: 'blob' })
  }
}
