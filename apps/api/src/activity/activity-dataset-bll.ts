import { ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { getSequelize } from '../_services/db'
import { filterDetecions, getDetectionDataBySpecies, getDetectionsBySite, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getRecordingsBySite, getRecordingTotalDurationMinutes, parseDetectionsBySite } from './activity-dataset-dao'

export const getActivityOverviewData = async (filter: FilterDataset, isProjectMember: boolean): Promise<ActivityDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const { locationProjectId } = filter

  const filterForSql = toFilterDatasetForSql(filter)

  // Filtering
  const totalDetections = await filterDetecions(models, locationProjectId, filter)
  const detectionsBySite = await getDetectionsBySite(sequelize, filterForSql)
  const recordingsBySite = await getRecordingsBySite(sequelize, filterForSql)
  const totalRecordingDuration = getRecordingTotalDurationMinutes(recordingsBySite)
  const activityBySite = parseDetectionsBySite(detectionsBySite, recordingsBySite)
  const activityBySpecies = await getDetectionDataBySpecies(models, totalDetections, totalRecordingDuration, isProjectMember, locationProjectId)
  const activityByTimeHour = getDetectionsByTimeHour(totalDetections, totalRecordingDuration)
  const activityByTimeDay = getDetectionsByTimeDay(totalDetections, totalRecordingDuration)
  const activityByTimeMonth = getDetectionsByTimeMonth(totalDetections, totalRecordingDuration)
  const activityByTimeDate = getDetectionsByTimeDateUnix(totalDetections, totalRecordingDuration)

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
