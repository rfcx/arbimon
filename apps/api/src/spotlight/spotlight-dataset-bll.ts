import { SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { FilterDataset } from '~/datasets/dataset-types'
import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { isProtectedSpecies } from '~/security/protected-species'
import { calculateDetectionCount, calculateDetectionFrequency, filterDetections, filterSpeciesDetection, getDetectionsByLocationSite, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getDetectionsByTimeMonthYear, getDetectionsByTimeYear, getRecordings, getRecordingTotalCount, getRecordingTotalDurationMinutes } from './spotlight-dataset-dao'

export async function getSpotlightDatasetData (filter: FilterDataset, taxonSpeciesId: number, isProjectMember: boolean): Promise<SpotlightDatasetResponse> {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const species = await models.TaxonSpecies.findOne({
    where: { id: taxonSpeciesId },
    raw: true
  })
  if (!species) throw BioNotFoundError()

  const { locationProjectId } = filter

  const filterForSql = toFilterDatasetForSql({ ...filter, taxonSpeciesId })

  const speciesIucn = await models.SpeciesInProject
    .findOne({
      where: { locationProjectId, taxonSpeciesId },
      attributes: ['riskRatingId'],
      raw: true
    })

  const isLocationRedacted = isProtectedSpecies(speciesIucn?.riskRatingId) && !isProjectMember

  // Filtering
  const totalDetections = await filterDetections(models, filterForSql)
  const specificSpeciesDetections = await filterSpeciesDetection(models, filterForSql, taxonSpeciesId)

  // Metrics
  const recordings = await getRecordings(models, filterForSql)
  const totalRecordingCount = getRecordingTotalCount(recordings)
  const totalRecordingMinutes = getRecordingTotalDurationMinutes(recordings)
  const detectionCount = calculateDetectionCount(specificSpeciesDetections)
  const detectionFrequency = calculateDetectionFrequency(specificSpeciesDetections, totalRecordingMinutes)

  const totalSiteCount = new Set(totalDetections.map(({ locationSiteId }) => locationSiteId)).size
  const occupiedSiteCount = new Set(specificSpeciesDetections.map(({ locationSiteId }) => locationSiteId)).size
  const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

  // By site
  const detectionsByLocationSite = isLocationRedacted ? {} : await getDetectionsByLocationSite(models, totalDetections, filterForSql)
  const detectionsByTimeHour = getDetectionsByTimeHour(specificSpeciesDetections, totalRecordingMinutes)
  const detectionsByTimeDay = getDetectionsByTimeDay(specificSpeciesDetections, totalRecordingMinutes)
  const detectionsByTimeMonth = getDetectionsByTimeMonth(specificSpeciesDetections, totalRecordingMinutes)
  const detectionsByTimeYear = getDetectionsByTimeYear(specificSpeciesDetections, totalRecordingMinutes)
  const detectionsByTimeDate = getDetectionsByTimeDateUnix(specificSpeciesDetections, totalRecordingMinutes)
  const detectionsByTimeMonthYear = getDetectionsByTimeMonthYear(specificSpeciesDetections, totalRecordingMinutes)

  return {
    totalSiteCount,
    totalRecordingCount,
    detectionCount,
    detectionFrequency,
    occupiedSiteCount,
    occupiedSiteFrequency,
    isLocationRedacted,
    detectionsByLocationSite,
    detectionsByTimeHour,
    detectionsByTimeDay,
    detectionsByTimeMonth,
    detectionsByTimeYear,
    detectionsByTimeDate,
    detectionsByTimeMonthYear
  }
}
