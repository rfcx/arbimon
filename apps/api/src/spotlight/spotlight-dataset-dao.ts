import { groupBy, mapValues, sum } from 'lodash-es'

import { SpotlightDetectionDataBySite, SpotlightDetectionDataByTime } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { Where } from '@rfcx-bio/common/dao/query-helpers/types'
import { DetectionBySiteSpeciesHour, RecordingBySiteHour } from '@rfcx-bio/common/dao/types'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { FilterDatasetForSql, whereInDataset } from '~/datasets/dataset-where'
import { dayjs } from '../_services/dayjs-initialized'

export async function filterDetections (models: AllModels, filter: FilterDatasetForSql): Promise<DetectionBySiteSpeciesHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = whereInDataset(filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export async function filterSpeciesDetection (models: AllModels, filter: FilterDatasetForSql, speciesId: number): Promise<DetectionBySiteSpeciesHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = whereInDataset(filter)

  return await models.DetectionBySiteSpeciesHour.findAll({
    where,
    raw: true
  })
}

export async function getRecordings (models: AllModels, filter: FilterDatasetForSql): Promise<RecordingBySiteHour[]> {
  const where: Where<DetectionBySiteSpeciesHour> = whereInDataset(filter)

  return await models.RecordingBySiteHour.findAll({
    where,
    raw: true
  }) as unknown as RecordingBySiteHour[]
}

export function getRecordingTotalDurationMinutes (recordings: RecordingBySiteHour[]): number {
  return sum(recordings.map(({ totalDurationInMinutes }) => totalDurationInMinutes))
}

export function getRecordingTotalCount (recordings: RecordingBySiteHour[]): number {
  return sum(recordings.map(({ recordingCount }) => recordingCount ?? 0))
}

export function calculateDetectionCount (detections: DetectionBySiteSpeciesHour[]): number {
  return sum(detections.map(({ count }) => count))
}

export function calculateDetectionFrequency (detections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): number {
  const totalDetectionMinutes = sum(detections.map(d => d.durationMinutes))
  return totalDetectionMinutes === 0 ? 0 : totalDetectionMinutes / totalRecordingCount
}

export async function getDetectionsByLocationSite (models: AllModels, totalDetections: DetectionBySiteSpeciesHour[], filter: FilterDatasetForSql): Promise<SpotlightDetectionDataBySite> {
  const summariesBySite: { [siteId: number]: DetectionBySiteSpeciesHour[] } = groupBy(totalDetections, 'locationSiteId')
  const locationProjectId = totalDetections[0].locationProjectId || -1
  const siteIds = Object.keys(summariesBySite)

  const sites = await models.LocationSite.findAll({
    where: { id: siteIds },
    raw: true
  })

  const summariesRecordingBySite: { [siteId: number]: RecordingBySiteHour[] } = {}

  // TODO: Improve the logic to get all sites recordings at once?
  for (const site of sites) {
    const siteTotalRecording = await getRecordings(models, { ...filter, locationProjectId, siteIds: [site.id] })
    summariesRecordingBySite[site.id] = siteTotalRecording
  }

  return mapValues(summariesBySite, (siteSummaries, siteIdString) => {
    const siteId = Number(siteIdString)
    const matchedSite = sites.find(s => s.id === siteId)

    const siteTotalRecordingCount = getRecordingTotalDurationMinutes(summariesRecordingBySite[siteId])

    const siteSpeciesSummaries = siteSummaries.filter(r => r.taxonSpeciesId === filter.speciesId)
    const siteDetectionCount = sum(siteSpeciesSummaries.map(({ count }) => count))
    const siteDetectionMinutes = sum(siteSpeciesSummaries.map(({ durationMinutes }) => durationMinutes))
    const siteDetectionFrequency = siteTotalRecordingCount === 0 ? 0 : siteDetectionMinutes / siteTotalRecordingCount
    const siteOccupied = siteSpeciesSummaries.length > 0

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
    detection: mapValues(byHour, calculateDetectionCount),
    detectionFrequency: mapValues(byHour, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDay (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byDay = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).isoWeekday() - 1)
  return {
    detection: mapValues(byDay, calculateDetectionCount),
    detectionFrequency: mapValues(byDay, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeMonth (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byMonth = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).month())
  return {
    detection: mapValues(byMonth, calculateDetectionCount),
    detectionFrequency: mapValues(byMonth, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const byYear = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).year())
  return {
    detection: mapValues(byYear, calculateDetectionCount),
    detectionFrequency: mapValues(byYear, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeDateUnix (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime {
  const SECONDS_PER_DAY = 24 * 60 * 60
  const byDateUnix = groupByNumber(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('day').unix() / SECONDS_PER_DAY)
  return {
    detection: mapValues(byDateUnix, calculateDetectionCount),
    detectionFrequency: mapValues(byDateUnix, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}

export function getDetectionsByTimeMonthYear (specificSpeciesDetections: DetectionBySiteSpeciesHour[], totalRecordingCount: number): SpotlightDetectionDataByTime<string> {
  const byMonthYear = groupBy(specificSpeciesDetections, d => dayjs.utc(d.timePrecisionHourLocal).startOf('month').format('MM/YYYY'))
  return {
    detection: mapValues(byMonthYear, calculateDetectionCount),
    detectionFrequency: mapValues(byMonthYear, (data) => calculateDetectionFrequency(data, totalRecordingCount))
  }
}
