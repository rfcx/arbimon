import { RichnessDatasetResponse, richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { RichnessByExportResponse, richnessByExportUrl } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { apiClient } from '~/api'
import { DatasetParameters } from '~/filters'
import { useStore } from '~/store'

export class RichnessService {
  constructor (private readonly baseUrl: string) {}

  async getRichnessDataset (rawFilter: DatasetParameters): Promise<RichnessDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return undefined

    const query = this.getFilterQuery(rawFilter)
    const url = `${this.baseUrl}${richnessDatasetUrl({ projectId })}?${query}`
    const resp = await apiClient.getOrUndefined<RichnessDatasetResponse>(url)

    return resp
  }

  async getRichnessBuExport (rawFilter: DatasetParameters): Promise<MockHourlyDetectionSummary[] | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return undefined

    const query = this.getFilterQuery(rawFilter)
    const url = `${this.baseUrl}${richnessByExportUrl({ projectId })}?${query}`
    const resp = await apiClient.getOrUndefined<RichnessByExportResponse>(url)

    return resp?.speciesByExport
  }

  getFilterQuery (rawFilter: DatasetParameters): string {
    const filter = {
      startDate: rawFilter.startDate.toISOString(),
      endDate: rawFilter.endDate.toISOString(),
      siteIds: rawFilter.sites.map(({ siteId }) => siteId),
      taxons: rawFilter.otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value)
    }

    return Object.entries(filter).map(([key, value]) => `${key}=${value.toString()}`).join('&')
  }
}
