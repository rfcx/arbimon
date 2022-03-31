import { groupBy, mapValues, sum } from 'lodash-es'
import { Op } from 'sequelize'

import { SpotlightDetectionDataBySite, SpotlightDetectionDataByTime } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { FilterDataset } from '../_services/datasets/dataset-types'
import { dayjs } from '../_services/dayjs-initialized'

export async function filterDetecions (models: AllModels, projectId: number, filter: FilterDataset): Promise<DetectionBySiteSpeciesHour[]> {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive
      }
    },
    projectId
  }

  if (siteIds.length > 0) {
    where.locationSiteId = siteIds
  }

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export async function filterSpeciesDetection (models: AllModels, projectId: number, filter: FilterDataset, speciesId: number): Promise<DetectionBySiteSpeciesHour[]> {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds } = filter

  const where: Where<DetectionBySiteSpeciesHour> = {
    timePrecisionHourLocal: {
      [Op.and]: {
        [Op.gte]: startDateUtcInclusive,
        [Op.lt]: endDateUtcInclusive
      }
    },
    projectId,
    taxonSpeciesId: speciesId
  }

  if (siteIds.length > 0) {
    where.locationSiteId = siteIds
  }

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export function getRecordingCount (summaries: DetectionBySiteSpeciesHour[]): number {
  const summariesBySiteHour = Object.values(groupBy(summaries, s => `${s.timePrecisionHourLocal.getTime()}-${s.locationSiteId}`))
  return sum(summariesBySiteHour.map(speciesSummaries => speciesSummaries[0].durationMinutes))
}

function calculateDetectionActivity (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

function calculateDetectionFrequencyActivity (detections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): number {
  const detectionCount = sum(detections.map(d => d.count))
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
}

export async function getDetectionsByLocationSite (models: AllModels, totalDetections: DetectionBySiteSpeciesHour[], speciesId: number): Promise<SpotlightDetectionDataBySite> {
  const summariesBySite: { [siteId: number]: DetectionBySiteSpeciesHour[] } = groupBy(totalDetections, 'locationSiteId')
  const siteIds = Object.keys(summariesBySite)

  // TODO ???: Move query to somewhere more global
  const sites = await models.LocationSite.findAll({
    where: { id: siteIds },
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

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionActivity),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionActivity),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionActivity),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byYear = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).year())
  return {
    detection: mapValues(byYear, calculateDetectionActivity),
    detectionFrequency: mapValues(byYear, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionActivity),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeMonthYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime<string> {
  const byMonthYear = groupBy(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('month').format('MM/YYYY'))
  return {
    detection: mapValues(byMonthYear, calculateDetectionActivity),
    detectionFrequency: mapValues(byMonthYear, (data) => calculateDetectionFrequencyActivity(data, totalRecordingCount))
  }
}
