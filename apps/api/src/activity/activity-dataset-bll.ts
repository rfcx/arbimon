import { ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { getSequelize } from '../_services/db'
import { combineDetectionsAndRecordings, filterDetections, getDetectionBySite, getDetectionDataBySpecies, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getTotalRecordedMinutes, getTotalRecordingsBySite } from './activity-dataset-dao'

export const getActivityOverviewData = async (filter: FilterDataset, isProjectMember: boolean): Promise<ActivityDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const { locationProjectId } = filter

  const filterForSql = toFilterDatasetForSql(filter)

  const detectionsBySite = await getDetectionBySite(sequelize, filterForSql)
  const recordingsBySite = await getTotalRecordingsBySite(sequelize, filterForSql)
  const totalRecordedMinutes = getTotalRecordedMinutes(recordingsBySite)
  const activityBySite = combineDetectionsAndRecordings(detectionsBySite, recordingsBySite)
  // TODO Refactor all activity* below to perform data processing in the db (and not by returning all detections)
  const totalDetections = await filterDetections(models, filterForSql)
  const activityBySpecies = await getDetectionDataBySpecies(models, totalDetections, totalRecordedMinutes, isProjectMember, locationProjectId)
  const activityByTimeHour = getDetectionsByTimeHour(totalDetections, totalRecordedMinutes)
  const activityByTimeDay = getDetectionsByTimeDay(totalDetections, totalRecordedMinutes)
  const activityByTimeMonth = getDetectionsByTimeMonth(totalDetections, totalRecordedMinutes)
  const activityByTimeDate = getDetectionsByTimeDateUnix(totalDetections, totalRecordedMinutes)

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
