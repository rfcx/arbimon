import { activityDatasetGeneratedUrl, ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { apiClient } from '~/api'
import { DatasetParameters } from '~/filters'
import { useStore } from '~/store'

export class ActivityService {
  constructor (private readonly baseUrl: string) {}

  async getActivityDataset (rawFilter: DatasetParameters): Promise<ActivityDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const filter = {
      startDate: rawFilter.startDate.toISOString(),
      endDate: rawFilter.endDate.toISOString(),
      siteIds: rawFilter.sites.map(({ id }) => id),
      taxons: rawFilter.otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value)
    }
    const query = Object.entries(filter).map(([key, value]) => `${key}=${value.toString()}`).join('&')
    const url = `${this.baseUrl}${activityDatasetGeneratedUrl({ projectId: projectId.toString() })}?${query}`
    const response = await apiClient.getOrUndefined<ActivityDatasetResponse>(url)

    return response
  }
}
