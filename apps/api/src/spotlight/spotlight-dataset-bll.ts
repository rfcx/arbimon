import { type SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { type FilterDataset } from '~/datasets/dataset-types'
import { toFilterDatasetForSql } from '~/datasets/dataset-where'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { isProtectedSpecies } from '~/security/protected-species'
import { calculateDetectionFrequency, calculateDetectionMinutesCount, filterDetections, getDetectionsByLocationSite, getDetectionsByTimeDateUnix, getDetectionsByTimeDay, getDetectionsByTimeHour, getDetectionsByTimeMonth, getDetectionsByTimeMonthYear, getDetectionsByTimeYear, getRecordedMinutesCount, getRecordedSitesCount } from './spotlight-dataset-dao'

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
  const filterForSqlWithoutTaxonSpeciesId = toFilterDatasetForSql(filter)
  const totalDetections = await filterDetections(models, filterForSqlWithoutTaxonSpeciesId)
  const specificSpeciesDetections = await filterDetections(models, filterForSql)

  // Metrics
  const recordedMinutesCount = await getRecordedMinutesCount(models, filterForSql)
  const detectionMinutesCount = calculateDetectionMinutesCount(specificSpeciesDetections)
  const detectionFrequency = calculateDetectionFrequency(specificSpeciesDetections, recordedMinutesCount)

  // All site in project that have recordings
  const totalSiteCount = await getRecordedSitesCount(models, filterForSqlWithoutTaxonSpeciesId)
  const occupiedSiteCount = new Set(specificSpeciesDetections.map(({ locationSiteId }) => locationSiteId)).size
  const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

  // By site
  const detectionsByLocationSite = isLocationRedacted ? {} : await getDetectionsByLocationSite(models, totalDetections, filterForSql)
  const detectionsByTimeHour = getDetectionsByTimeHour(specificSpeciesDetections, recordedMinutesCount)
  const detectionsByTimeDay = getDetectionsByTimeDay(specificSpeciesDetections, recordedMinutesCount)
  const detectionsByTimeMonth = getDetectionsByTimeMonth(specificSpeciesDetections, recordedMinutesCount)
  const detectionsByTimeYear = getDetectionsByTimeYear(specificSpeciesDetections, recordedMinutesCount)
  const detectionsByTimeDate = getDetectionsByTimeDateUnix(specificSpeciesDetections, recordedMinutesCount)
  const detectionsByTimeMonthYear = getDetectionsByTimeMonthYear(specificSpeciesDetections, recordedMinutesCount)

  return {
    totalSiteCount,
    recordedMinutesCount,
    detectionMinutesCount,
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
