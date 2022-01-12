import { apiClient } from '~/api'

export class APITemplateService {
  constructor (private readonly baseUrl: string) {}

  async getAPITemplateExample (): Promise<undefined> {
    return await apiClient.getOrUndefined<undefined>(`${this.baseUrl}`)
  }
}
