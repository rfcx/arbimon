import { groupBy, mapValues, sum } from 'lodash-es'
import { Op } from 'sequelize'

import { SpotlightDetectionDataBySite, SpotlightDetectionDataByTime } from '@rfcx-bio/common/api-bio/spotlight/common'
import { SpotlightDatasetParams, SpotlightDatasetQuery, SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { AllModels, ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { Handler } from '../_services/api-helpers/types'
import { dayjs } from '../_services/dayjs-initialized'
import { getSequelize } from '../_services/db'
import { BioInvalidQueryParamError, BioNotFoundError } from '../_services/errors'
import { FilterDataset } from '../_services/mock-helper'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { isProtectedSpecies } from '../_services/security/location-redacted'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'

export const spotlightDatasetHandler: Handler<SpotlightDatasetResponse, SpotlightDatasetParams, SpotlightDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const { speciesId: speciesIdString, startDate: startDateUtcInclusive, endDate: endDateUtcInclusive, siteIds, taxons } = req.query
  const speciesId = Number(speciesIdString)
  if (isNaN(speciesId)) throw BioInvalidQueryParamError({ speciesIdString })
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDateUtcInclusive })

  const hasProjectPermission = isProjectMember(req)

  // Query
  const convertedQuery = {
    startDateUtcInclusive,
    endDateUtcInclusive,
    // TODO ???: Better way to check query type!
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : typeof siteIds === 'string' ? [Number(siteIds)] : [],
    taxons: Array.isArray(taxons) ? taxons : typeof taxons === 'string' ? [taxons] : []
  }

  return await getSpotlightDatasetInformation(Number(projectId), { ...convertedQuery }, speciesId, hasProjectPermission)
}

async function getSpotlightDatasetInformation (projectId: number, filter: FilterDataset, speciesId: number, hasProjectPermission: boolean): Promise<SpotlightDatasetResponse> {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const species = await models.TaxonSpecies.findOne({
    where: {
      id: speciesId
    },
    raw: true
  })

  if (!species) throw BioNotFoundError()
  const isLocationRedacted = hasProjectPermission ? false : await isProtectedSpecies(species.id)

  // Filtering
  const totalDetections = await filterDetecions(models, filter)
  const specificSpeciesDetections = await filterSpeciesDetection(models, filter, speciesId)

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
  const detectionsByTimeDate = getDdetectionsByTimeDate(specificSpeciesDetections, totalRecordingCount)
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

async function filterDetecions (models: AllModels, filter: FilterDataset): Promise<DetectionBySiteSpeciesHour[]> {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds } = filter

  const where = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive
      }
    }
  }

  if (siteIds.length > 0) {
    // TODO: Update the type
    // @ts-expect-error
    where.locationSiteId = siteIds
  }

  return await models.DetectionsBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

async function filterSpeciesDetection (models: AllModels, filter: FilterDataset, speciesId: number): Promise<DetectionBySiteSpeciesHour[]> {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds } = filter

  const where = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive
      }
    },
    taxonSpeciesId: speciesId
  }

  if (siteIds.length > 0) {
    // TODO: Update the type
    // @ts-expect-error
    where.locationSiteId = siteIds
  }

  return await models.DetectionsBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

function getRecordingCount (detections: DetectionBySiteSpeciesHour[]): number {
  // TODO: Better way to handle case where `durationMinutes` is not stable
  const durationMinutes = detections.length > 0 ? detections[0].durationMinutes : 0
  return new Set(detections.map(d => d.timePrecisionHourLocal)).size * durationMinutes
}

function calculateDetectionActivity (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

function calculateDetectionFrequencyActivity (detections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): number {
  const detectionCount = sum(detections.map(d => d.count))
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
}

async function getDetectionsByLocationSite (models: ModelRepository, totalDetections: DetectionBySiteSpeciesHour[], speciesId: number): Promise<SpotlightDetectionDataBySite> {
  const summariesBySite: { [siteId: number]: DetectionBySiteSpeciesHour[] } = groupBy(totalDetections, 'locationSiteId')

  // TODO ???: Move query to somewhere more global
  const sites = await models.LocationSite.findAll({
    where: {
      id: Object.keys(summariesBySite)
    },
    raw: true
  })

  return mapValues(summariesBySite, (siteSummaries, siteIdString) => {
    const siteTotalRecordingCount = getRecordingCount(siteSummaries)

    const siteSpeciesSummaries = siteSummaries.filter(r => r.taxonSpeciesId === speciesId)
    const siteDetectionCount = sum(siteSpeciesSummaries.map(({ count }) => count))
    const siteDetectionFrequency = siteTotalRecordingCount === 0 ? 0 : siteDetectionCount / siteTotalRecordingCount
    const siteOccupied = siteSpeciesSummaries.length > 0

    const siteId = Number(siteIdString)
    const matchedSite = sites.find(s => s.id === siteId)

    return {
      siteId,
      siteName: matchedSite?.name ?? '',
      latitude: matchedSite?.latitude ?? 0,
      longitude: matchedSite?.longitude ?? 0,
      siteDetectionCount,
      siteDetectionFrequency,
      siteOccupied
    }
  })
}

function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionActivity),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionActivity),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionActivity),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

function getDetectionsByTimeYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byYear = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).year())
  return {
    detection: mapValues(byYear, calculateDetectionActivity),
    detectionFrequency: mapValues(byYear, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

function getDdetectionsByTimeDate (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byDate = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).date())
  return {
    detection: mapValues(byDate, calculateDetectionActivity),
    detectionFrequency: mapValues(byDate, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

function getDetectionsByTimeMonthYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byMonthYear = groupBy(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).format('MM/YYYY'))
  return {
    detection: mapValues(byMonthYear, calculateDetectionActivity),
    detectionFrequency: mapValues(byMonthYear, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}
