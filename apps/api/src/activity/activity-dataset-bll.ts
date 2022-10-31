import { sum } from 'lodash-es'

import { ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { getSequelize } from '../_services/db'
import { combineDetectionsAndRecordings, getDetectionBySite, getDetectionDataBySpecies, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getTotalRecordingsBySite } from './activity-dataset-dao'

export const getActivityOverviewData = async (filter: FilterDataset, isProjectMember: boolean): Promise<ActivityDatasetResponse> => {
  const sequelize = getSequelize()

  const filterForSql = toFilterDatasetForSql(filter)

  const [detectionsBySite, recordingsBySite] = await Promise.all([
    getDetectionBySite(sequelize, filterForSql),
    getTotalRecordingsBySite(sequelize, filterForSql)
  ])
  const totalRecordedMinutes = sum(recordingsBySite.map(r => r.count))
  const totalSites = recordingsBySite.length
  const activityBySite = combineDetectionsAndRecordings(detectionsBySite, recordingsBySite)
  // TODO Refactor all activity* below to perform data processing in the db (and not by returning all detections)
  const [activityBySpecies, activityByTimeHour, activityByTimeDay, activityByTimeMonth, activityByTimeDate] = await Promise.all([
    getDetectionDataBySpecies(sequelize, filterForSql, totalRecordedMinutes, totalSites, isProjectMember),
    getDetectionsByTimeHour(sequelize, filterForSql, totalRecordedMinutes),
    getDetectionsByTimeDay(sequelize, filterForSql, totalRecordedMinutes),
    getDetectionsByTimeMonth(sequelize, filterForSql, totalRecordedMinutes),
    getDetectionsByTimeDateUnix(sequelize, filterForSql, totalRecordedMinutes)])

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
