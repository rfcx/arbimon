import { RichnessDatasetResponse, richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { RichnessByExportReport, RichnessByExportResponse, richnessByExportUrl } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { apiClient } from '~/api'
import { DatasetParameters } from '~/filters'
import { useStore } from '~/store'

export class RichnessService {
  constructor (private readonly baseUrl: string) {}

  async getRichnessDataset (rawFilter: DatasetParameters): Promise<RichnessDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const query = this.getFilterQuery(rawFilter)
    const url = `${this.baseUrl}${richnessDatasetUrl({ projectId: projectId.toString() })}?${query}`
    const resp = await apiClient.getOrUndefined<RichnessDatasetResponse>(url)

    return resp
  }

  async getRichnessByExport (rawFilter: DatasetParameters): Promise<RichnessByExportReport[] | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const query = this.getFilterQuery(rawFilter)
    const url = `${this.baseUrl}${richnessByExportUrl({ projectId: projectId.toString() })}?${query}`
    const resp = await apiClient.getOrUndefined<RichnessByExportResponse>(url)

    return resp?.speciesByExport
  }

  getFilterQuery (rawFilter: DatasetParameters): string {
    const filter = {
      startDate: rawFilter.startDate.toISOString(),
      endDate: rawFilter.endDate.toISOString(),
      siteIds: rawFilter.sites.map(({ id }) => id),
      taxons: rawFilter.otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value)
    }

    return Object.entries(filter).map(([key, value]) => `${key}=${value.toString()}`).join('&')
  }
}
