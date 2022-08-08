import { ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { getSequelize } from '../_services/db'
import { filterDetections, getDetectionBySite, getDetectionDataBySpecies, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getRecordingBySite, getRecordingTotalDurationMinutes, parseDetectionsBySite } from './activity-dataset-dao'

export const getActivityOverviewData = async (filter: FilterDataset, isProjectMember: boolean): Promise<ActivityDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const { locationProjectId } = filter

  const filterForSql = toFilterDatasetForSql(filter)

  // Filtering
  const totalDetections = await filterDetections(models, filterForSql)
  const detectionsBySite = await getDetectionBySite(sequelize, filterForSql)
  const recordingsBySite = await getRecordingBySite(sequelize, filterForSql)
  const totalRecordingDurationMinutes = getRecordingTotalDurationMinutes(recordingsBySite)
  const activityBySite = parseDetectionsBySite(detectionsBySite, recordingsBySite)
  const activityBySpecies = await getDetectionDataBySpecies(models, totalDetections, totalRecordingDurationMinutes, isProjectMember, locationProjectId)
  const activityByTimeHour = getDetectionsByTimeHour(totalDetections, totalRecordingDurationMinutes)
  const activityByTimeDay = getDetectionsByTimeDay(totalDetections, totalRecordingDurationMinutes)
  const activityByTimeMonth = getDetectionsByTimeMonth(totalDetections, totalRecordingDurationMinutes)
  const activityByTimeDate = getDetectionsByTimeDateUnix(totalDetections, totalRecordingDurationMinutes)

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
