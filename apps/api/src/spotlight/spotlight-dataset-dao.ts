import { groupBy, mapValues, sum } from 'lodash-es'

import { SpotlightDetectionDataBySite, SpotlightDetectionDataByTime } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour, RecordingBySiteHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { FilterDatasetForSql, whereInDataset, whereRecordingBySiteHour } from '~/datasets/dataset-where'
import { getSequelize } from '~/db'
import { dayjs } from '../_services/dayjs-initialized'

export async function filterDetections (models: AllModels, filter: FilterDatasetForSql): Promise<DetectionBySiteSpeciesHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = whereInDataset(filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export async function filterSpeciesDetection (models: AllModels, filter: FilterDatasetForSql): Promise<DetectionBySiteSpeciesHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = whereInDataset(filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export async function getRecordedMinutesCount (models: AllModels, filter: FilterDatasetForSql): Promise<number> {
  const where: Where<RecordingBySiteHour> = whereRecordingBySiteHour(filter)
  return await models.RecordingBySiteHour.sum('count', { where }) ?? 0
}

export async function getRecordedSitesCount (models: AllModels, filter: FilterDatasetForSql): Promise<number> {
  const where: Where<RecordingBySiteHour> = whereRecordingBySiteHour(filter)
  return await models.RecordingBySiteHour.count({ where, distinct: true, col: 'location_site_id' })
}

export function calculateDetectionMinutesCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

export function calculateDetectionFrequency (detections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): number {
  const totalDetectionMinutes = sum(detections.map(d => d.count))
  return totalDetectionMinutes === 0 ? 0 : totalDetectionMinutes / totalRecordedMinutes
}

export const getRecordedMinutesCountGroupBySite = async (models: AllModels, filter: FilterDatasetForSql): Promise<any> => {
  const sequelize = getSequelize()
  const where: Where<RecordingBySiteHour> = whereRecordingBySiteHour(filter)
  return await models
    .RecordingBySiteHour
    .findAll({
      attributes: ['locationSiteId', [sequelize.literal('SUM(count)::integer'), 'count']],
      where,
      group: 'location_site_id',
      raw: true
    }) as unknown as Array<{ locationSiteId: number, count: number }>
}

export async function getDetectionsByLocationSite (models: AllModels, totalDetections: DetectionBySiteSpeciesHour[], filter: FilterDatasetForSql): Promise<SpotlightDetectionDataBySite> {
  const summariesBySite: { [siteId: number]: DetectionBySiteSpeciesHour[] } = groupBy(totalDetections, 'locationSiteId')
  const siteIds = Object.keys(summariesBySite)

  const sites = await models.LocationSite.findAll({
    where: { id: siteIds },
    raw: true
  })

  const summariesRecordingBySite: { [siteId: number]: number } = {}

  // get all sites recordings at once
  const locationProjectId = filter.locationProjectId || -1
  const recordedMinutesCountBySites = await getRecordedMinutesCountGroupBySite(models, { ...filter, locationProjectId, siteIds: siteIds.map(Number) })
  for (const site of recordedMinutesCountBySites) {
    summariesRecordingBySite[site.locationSiteId] = site.count
  }

  return mapValues(summariesBySite, (siteSummaries, siteIdString) => {
    const siteId: number = Number(siteIdString)
    const matchedSite = sites.find(s => s.id === siteId)
    const siteTotalRecordedMinutes = summariesRecordingBySite !== undefined ? summariesRecordingBySite[siteId] : 0
    const siteSpeciesSummaries = siteSummaries.filter(r => r.taxonSpeciesId === filter.taxonSpeciesId)
    const siteDetectionMinutesCount = calculateDetectionMinutesCount(siteSpeciesSummaries)
    const siteDetectionFrequency = siteTotalRecordedMinutes === 0 ? 0 : siteDetectionMinutesCount / siteTotalRecordedMinutes
    const siteOccupied = siteSpeciesSummaries.length > 0

    return {
      siteId,
      siteName: matchedSite?.name ?? '',
      latitude: matchedSite?.latitude ?? 0,
      longitude: matchedSite?.longitude ?? 0,
      siteDetectionMinutesCount,
      siteDetectionFrequency,
      siteOccupied
    }
  })
}

export function getDetectionsByTimeHour (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): SpotlightDetectionDataByTime {
  const byHour = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).hour())
  return {
    detection: mapValues(byHour, calculateDetectionMinutesCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): SpotlightDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionMinutesCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): SpotlightDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionMinutesCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): SpotlightDetectionDataByTime {
  const byYear = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).year())
  return {
    detection: mapValues(byYear, calculateDetectionMinutesCount),
    detectionFrequency: mapValues(byYear, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): SpotlightDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionMinutesCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}

export function getDetectionsByTimeMonthYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordedMinutes: number): SpotlightDetectionDataByTime<string> {
  const byMonthYear = groupBy(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('month').format('MM/YYYY'))
  return {
    detection: mapValues(byMonthYear, calculateDetectionMinutesCount),
    detectionFrequency: mapValues(byMonthYear, (data) => calculateDetectionFrequency(data, totalRecordedMinutes))
  }
}
