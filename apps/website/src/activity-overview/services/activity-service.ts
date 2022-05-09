import { activityDatasetGeneratedUrl, ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { apiClient } from '~/api'
import { DetectionFilter, generateFilterQuery } from '~/filters'
import { useStore } from '~/store'

export class ActivityService {
  constructor (private readonly baseUrl: string) {}

  async getActivityDataset (rawFilter: DetectionFilter): Promise<ActivityDatasetResponse | undefined> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (projectId === undefined) return undefined

    const query = generateFilterQuery(rawFilter)

    const url = `${this.baseUrl}${activityDatasetGeneratedUrl({ projectId: projectId.toString() })}?${query}`
    const response = await apiClient.getOrUndefined<ActivityDatasetResponse>(url)

    return response
  }
}
