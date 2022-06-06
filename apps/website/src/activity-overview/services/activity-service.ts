import { AxiosInstance } from 'axios'

import { activityDatasetGeneratedUrl, ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DatasetParameters, generateFilterQuery } from '~/filters'

export const getActivityDataset = async (apiClient: AxiosInstance, projectId: number, rawFilter: DatasetParameters): Promise<ActivityDatasetResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `${activityDatasetGeneratedUrl({ projectId: projectId.toString() })}?${generateFilterQuery(rawFilter)}`)
