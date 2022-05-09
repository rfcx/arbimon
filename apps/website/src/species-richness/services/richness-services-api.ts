import { RichnessDatasetResponse, richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { RichnessByExportReportRow, RichnessExportResponse, richnessExportUrl } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { apiClient } from '~/api'
import { DetectionFilter, generateFilterQuery } from '~/filters'
import { useStore } from '~/store'

export class RichnessService {
  constructor (private readonly baseUrl: string) {}

  async getRichnessDataset (rawFilter: DetectionFilter): Promise<RichnessDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const query = generateFilterQuery(rawFilter)
    const url = `${this.baseUrl}${richnessDatasetUrl({ projectId: projectId.toString() })}?${query}`
    const resp = await apiClient.getOrUndefined<RichnessDatasetResponse>(url)

    return resp
  }

  async getRichnessExport (rawFilter: DetectionFilter): Promise<RichnessByExportReportRow[]> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return []

    const query = generateFilterQuery(rawFilter)
    const url = `${this.baseUrl}${richnessExportUrl({ projectId: projectId.toString() })}?${query}`
    const resp = await apiClient.getOrUndefined<RichnessExportResponse>(url)

    return resp?.richnessExport ?? []
  }
}
