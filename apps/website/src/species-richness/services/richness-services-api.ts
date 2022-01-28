import { RichnessDatasetResponse, richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { apiClient } from '~/api'
import { useStore } from '~/store'

export class RichnessService {
  constructor (private readonly baseUrl: string) {}

  async getRichnessDataset (): Promise<RichnessDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return undefined

    const url = `${this.baseUrl}${richnessDatasetUrl({ projectId })}`
    const resp = await apiClient.getOrUndefined<RichnessDatasetResponse>(url)
    return resp
  }
}
