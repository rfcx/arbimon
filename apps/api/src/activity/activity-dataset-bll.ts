import { ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { FilterDataset } from '../_services/datasets/dataset-types'
import { getSequelize } from '../_services/db'
import { filterDetecions, getDetectionDataBySite, getDetectionDataBySpecies, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getRecordingDurationMinutes } from './activity-dataset-dao'

export const getActivityOverviewData = async (filter: FilterDataset, hasProjectPermission: boolean): Promise<ActivityDatasetResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const { locationProjectId } = filter

  // Filtering
  const totalDetections = await filterDetecions(models, locationProjectId, filter)
  const totalRecordingCount = getRecordingDurationMinutes(totalDetections)

  const detectionsBySite = await getDetectionDataBySite(models, totalDetections)
  const detectionsBySpecies = await getDetectionDataBySpecies(models, totalDetections, hasProjectPermission, locationProjectId)
  const detectionsByTimeHour = getDetectionsByTimeHour(totalDetections, totalRecordingCount)
  const detectionsByTimeDay = getDetectionsByTimeDay(totalDetections, totalRecordingCount)
  const detectionsByTimeMonth = getDetectionsByTimeMonth(totalDetections, totalRecordingCount)
  const detectionsByTimeDate = getDetectionsByTimeDateUnix(totalDetections, totalRecordingCount)

  return {
    isLocationRedacted: !hasProjectPermission,
    detectionsBySite,
    detectionsBySpecies,
    detectionsByTimeHour,
    detectionsByTimeDay,
    detectionsByTimeMonth,
    detectionsByTimeDate
  }
}
