import { RichnessDatasetResponse, richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { apiClient } from '~/api'
import { DatasetParameters, generateFilterQuery } from '~/filters'
import { useStore } from '~/store'

export class RichnessService {
  constructor (private readonly baseUrl: string) {}

  async getRichnessDataset (rawFilter: DatasetParameters): Promise<RichnessDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const query = generateFilterQuery(rawFilter)
    const url = `${this.baseUrl}${richnessDatasetUrl({ projectId: projectId.toString() })}?${query}`
    const resp = await apiClient.getOrUndefined<RichnessDatasetResponse>(url)

    return resp
  }
}
