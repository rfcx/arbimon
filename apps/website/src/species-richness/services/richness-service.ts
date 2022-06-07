import { AxiosInstance } from 'axios'

import { RichnessDatasetResponse, richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { RichnessByExportReportRow, richnessExportUrl } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DatasetParameters, generateFilterQuery } from '~/filters'

export const getRichnessDataset = async (apiClient: AxiosInstance, projectId: number, rawFilter: DatasetParameters): Promise<RichnessDatasetResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `${richnessDatasetUrl({ projectId: projectId.toString() })}?${generateFilterQuery(rawFilter)}`)

export const getRichnessExport = async (apiClient: AxiosInstance, projectId: number, rawFilter: DatasetParameters): Promise<RichnessByExportReportRow[]> =>
  await apiGetOrUndefined(apiClient, `${richnessExportUrl({ projectId: projectId.toString() })}?${generateFilterQuery(rawFilter)}`) ?? []
