import { ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { getSequelize } from '../_services/db'
import { filterDetecions, getDetectionDataBySpecies, getDetectionsBySite, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getRecordingDurationMinutes } from './activity-dataset-dao'

export const getActivityOverviewData = async (filter: FilterDataset, isProjectMember: boolean): Promise<ActivityDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const { projectVersionId } = filter

  const filterForSql = toFilterDatasetForSql(filter)

  // Filtering
  const totalDetections = await filterDetecions(models, projectVersionId, filter)
  const totalRecordingCount = await getRecordingDurationMinutes(models, projectVersionId, filter)
  const activityBySite = await getDetectionsBySite(sequelize, filterForSql)
  const activityBySpecies = await getDetectionDataBySpecies(models, totalDetections, isProjectMember, projectVersionId, filter)
  const activityByTimeHour = getDetectionsByTimeHour(totalDetections, totalRecordingCount)
  const activityByTimeDay = getDetectionsByTimeDay(totalDetections, totalRecordingCount)
  const activityByTimeMonth = getDetectionsByTimeMonth(totalDetections, totalRecordingCount)
  const activityByTimeDate = getDetectionsByTimeDateUnix(totalDetections, totalRecordingCount)

  return {
    isLocationRedacted: !isProjectMember,
    activityBySite,
    activityBySpecies,
    activityByTimeHour,
    activityByTimeDay,
    activityByTimeMonth,
    activityByTimeDate
  }
}
