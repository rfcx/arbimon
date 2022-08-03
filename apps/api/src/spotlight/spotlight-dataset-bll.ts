import { SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { FilterDataset } from '~/datasets/dataset-types'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { isProtectedSpecies } from '~/security/protected-species'
import { calculateDetectionCount, calculateDetectionFrequency, filterDetections, filterSpeciesDetection, getDetectionsByLocationSite, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getDetectionsByTimeMonthYear, getDetectionsByTimeYear, getRecordings, getRecordingTotalCount, getRecordingTotalDurationMinutes } from './spotlight-dataset-dao'

export async function getSpotlightDatasetData (filter: FilterDataset, speciesId: number, isProjectMember: boolean): Promise<SpotlightDatasetResponse> {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const species = await models.TaxonSpecies.findOne({
    where: { id: speciesId },
    raw: true
  })
  if (!species) throw BioNotFoundError()

  const { locationProjectId } = filter

  const speciesIucn = await models.SpeciesInProject
    .findOne({
      where: { locationProjectId, taxonSpeciesId: speciesId },
      attributes: ['riskRatingId'],
      raw: true
    })

  const isLocationRedacted = isProtectedSpecies(speciesIucn?.riskRatingId) && !isProjectMember

  // Filtering
  const totalDetections = await filterDetections(models, locationProjectId, filter)
  const specificSpeciesDetections = await filterSpeciesDetection(models, locationProjectId, filter, speciesId)

  // Metrics
  const recordings = await getRecordings(models, locationProjectId, filter)
  // TODO: add recording_minutes to the recording_by_site_hour table to calculate count oof input recordings from Arbimon
  const totalRecordingCount = getRecordingTotalCount(recordings)
  const totalRecordingMinutes = getRecordingTotalDurationMinutes(recordings)
  const detectionCount = calculateDetectionCount(specificSpeciesDetections)
  const detectionFrequency = calculateDetectionFrequency(specificSpeciesDetections, totalRecordingMinutes)

  const totalSiteCount = new Set(totalDetections.map(({ locationSiteId }) => locationSiteId)).size
  const occupiedSiteCount = new Set(specificSpeciesDetections.map(({ locationSiteId }) => locationSiteId)).size
  const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

  // By site
  const detectionsByLocationSite = isLocationRedacted ? {} : await getDetectionsByLocationSite(models, totalDetections, filter, speciesId)
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
