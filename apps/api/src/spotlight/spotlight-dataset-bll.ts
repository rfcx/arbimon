import { sum } from 'lodash-es'

import { SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { FilterDataset } from '~/datasets/dataset-types'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { isProtectedSpecies } from '~/security/protected-species'
import { filterDetecions, filterSpeciesDetection, getDetectionsByLocationSite, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getDetectionsByTimeMonthYear, getDetectionsByTimeYear, getRecordingCount } from './spotlight-dataset-dao'

export async function getSpotlightDatasetData (filter: FilterDataset, speciesId: number, hasProjectPermission: boolean): Promise<SpotlightDatasetResponse> {
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

  const isLocationRedacted = isProtectedSpecies(speciesIucn?.riskRatingId) && !hasProjectPermission

  // Filtering
  const totalDetections = await filterDetecions(models, locationProjectId, filter)
  const specificSpeciesDetections = await filterSpeciesDetection(models, locationProjectId, filter, speciesId)

  // Metrics
  const totalRecordingCount = getRecordingCount(totalDetections)
  const detectionCount = sum(specificSpeciesDetections.map(({ count }) => count)) // 1 recording = 1 detection
  const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount

  const totalSiteCount = new Set(totalDetections.map(({ locationSiteId }) => locationSiteId)).size
  const occupiedSiteCount = new Set(specificSpeciesDetections.map(({ locationSiteId }) => locationSiteId)).size
  const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

  // By site
  const detectionsByLocationSite = isLocationRedacted ? {} : await getDetectionsByLocationSite(models, totalDetections, speciesId)
  const detectionsByTimeHour = getDetectionsByTimeHour(specificSpeciesDetections, totalRecordingCount)
  const detectionsByTimeDay = getDetectionsByTimeDay(specificSpeciesDetections, totalRecordingCount)
  const detectionsByTimeMonth = getDetectionsByTimeMonth(specificSpeciesDetections, totalRecordingCount)
  const detectionsByTimeYear = getDetectionsByTimeYear(specificSpeciesDetections, totalRecordingCount)
  const detectionsByTimeDate = getDetectionsByTimeDateUnix(specificSpeciesDetections, totalRecordingCount)
  const detectionsByTimeMonthYear = getDetectionsByTimeMonthYear(specificSpeciesDetections, totalRecordingCount)

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
