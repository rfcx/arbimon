import { groupBy, mapValues, sum } from 'lodash-es'
import { Op } from 'sequelize'

import { ActivitySpotlightDataByExport, ActivitySpotlightDataBySite, ActivitySpotlightDataByTime } from '@rfcx-bio/common/api-bio/spotlight/common'
import { SpotlightDatasetParams, SpotlightDatasetQuery, SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { ModelRepository, ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { MockHourlyDetectionSummary, rawDetections } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { Handler } from '../_services/api-helpers/types'
import { dayjs } from '../_services/dayjs-initialized'
import { getSequelize } from '../_services/db'
import { BioInvalidQueryParamError, BioNotFoundError } from '../_services/errors'
import { FilterDataset, filterMocksByParameters, filterMocksBySpecies } from '../_services/mock-helper'
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
  const models = ModelRepositoryFactory.getInstance(sequelize)

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
  // ! to be remove
  const totalSummaries = filterMocksByParameters(rawDetections, filter)
  const activityBySite = isLocationRedacted ? {} : getActivityDataBySite(totalSummaries, speciesId)
  const activityByTime = getActivityDataByTime(totalSummaries, speciesId)
  const activityByExport = getActivityDataExport(totalSummaries, speciesId)

  return {
    totalSiteCount,
    totalRecordingCount,
    detectionCount,
    detectionFrequency,
    occupiedSiteCount,
    occupiedSiteFrequency,
    isLocationRedacted,
    activityBySite,
    activityByTime,
    activityByExport
  }
}

async function filterDetecions (models: ModelRepository, filter: FilterDataset): Promise<DetectionBySiteSpeciesHour[]> {
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

async function filterSpeciesDetection (models: ModelRepository, filter: FilterDataset, speciesId: number): Promise<DetectionBySiteSpeciesHour[]> {
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

// @deprecated
function getMockRecordingCount (detections: MockHourlyDetectionSummary[]): number {
  return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
}

function calculateDetectionActivity (detections: MockHourlyDetectionSummary[]): number {
  return sum(detections.map(d => d.num_of_recordings))
}

function calculateDetectionFrequencyActivity (detections: MockHourlyDetectionSummary[], totalRecordingCount: number): number {
  const detectionCount = sum(detections.map(d => d.num_of_recordings))
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
}

function getActivityDataBySite (totalSummaries: MockHourlyDetectionSummary[], speciesId: number): ActivitySpotlightDataBySite {
  const summariesBySite: { [siteId: string]: MockHourlyDetectionSummary[] } = groupBy(totalSummaries, 'stream_id')
  return mapValues(summariesBySite, (siteSummaries, siteId) => {
    const siteTotalRecordingCount = getMockRecordingCount(siteSummaries)

    const siteSpeciesSummaries = filterMocksBySpecies(siteSummaries, speciesId)
    const siteDetectionCount = sum(siteSpeciesSummaries.map(d => d.num_of_recordings))
    const siteDetectionFrequency = siteTotalRecordingCount === 0 ? 0 : siteDetectionCount / siteTotalRecordingCount

    const siteOccupied = siteSpeciesSummaries.length > 0

    return {
      siteId,
      siteName: siteSummaries[0].name,
      latitude: siteSummaries[0].lat,
      longitude: siteSummaries[0].lon,
      siteDetectionCount,
      siteDetectionFrequency,
      siteOccupied
    }
  })
}

function getActivityDataByTime (totalSummaries: MockHourlyDetectionSummary[], speciesId: number): ActivitySpotlightDataByTime {
  const totalRecordingCount = getMockRecordingCount(totalSummaries)
  const speciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)

  const SECONDS_PER_DAY = 86400 // 24 * 60 * 60

  const byHour = groupByNumber(speciesSummaries, d => d.hour)
  const byDay = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).isoWeekday() - 1)
  const byMonth = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).month())
  const byDate = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).startOf('day').unix() / SECONDS_PER_DAY) // each chart tick should be a day not a second

  return {
    hourOfDay: {
      detection: mapValues(byHour, calculateDetectionActivity),
      detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
    },
    dayOfWeek: {
      detection: mapValues(byDay, calculateDetectionActivity),
      detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
    },
    monthOfYear: {
      detection: mapValues(byMonth, calculateDetectionActivity),
      detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
    },
    dateSeries: {
      detection: mapValues(byDate, calculateDetectionActivity),
      detectionFrequency: mapValues(byDate, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
    }
  }
}

function getActivityDataExport (totalSummaries: MockHourlyDetectionSummary[], speciesId: number): ActivitySpotlightDataByExport {
  const totalRecordingCount = getMockRecordingCount(totalSummaries)
  const speciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)

  const hourGrouped = groupByNumber(speciesSummaries, d => d.hour)
  const monthYearGrouped = groupBy(speciesSummaries, d => dayjs.utc(d.date).format('MM/YYYY'))
  const yearGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).year())

  return {
    hour: {
      detection: mapValues(hourGrouped, calculateDetectionActivity),
      detectionFrequency: mapValues(hourGrouped, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
    },
    month: {
      detection: mapValues(monthYearGrouped, calculateDetectionActivity),
      detectionFrequency: mapValues(monthYearGrouped, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
    },
    year: {
      detection: mapValues(yearGrouped, calculateDetectionActivity),
      detectionFrequency: mapValues(yearGrouped, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
    }
  }
}
