import { groupBy, mapValues, sum } from 'lodash-es'

import { ActivityDatasetParams, ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { ActivityOverviewDataBySite, ActivityOverviewDataBySpecies, ActivityOverviewDataByTime, DetectionGroupedBySite } from '@rfcx-bio/common/api-bio/activity/common'
import { FilterDatasetQuery } from '@rfcx-bio/common/api-bio/common/filter'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
import { MockHourlyDetectionSummary, rawDetections, rawSites, rawSpecies } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { Handler } from '../_services/api-helpers/types'
import { dayjs } from '../_services/dayjs-initialized'
import { FilterDataset, filterMocksByParameters } from '../_services/mock-helper'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'

export const activityDatasetHandler: Handler<ActivityDatasetResponse, ActivityDatasetParams, FilterDatasetQuery> = async (req) => {
  // Input & validation
  const { projectId } = req.params
  if (!projectId) assertParamsExist({ projectId })

  const { startDate, endDate, siteIds, taxons } = req.query
  if (!isValidDate(startDate)) assertInvalidQuery({ startDate })
  if (!isValidDate(endDate)) assertInvalidQuery({ endDate })

  // Query
  const convertedQuery: FilterDataset = {
    startDateUtcInclusive: startDate,
    endDateUtcInclusive: endDate,
    siteIds: siteIds ?? [],
    taxons: taxons ?? []
  }

  const isLocationRedacted = !isProjectMember(req)

  // Response
  return await getActivityOverviewData({ ...convertedQuery }, isLocationRedacted)
}

const getActivityOverviewData = async (filter: FilterDataset, isLocationRedacted: boolean): Promise<ActivityDatasetResponse> => {
  const totalSummaries = filterMocksByParameters(rawDetections, filter)
  const detectionsBySites = groupBy(totalSummaries, 'stream_id')
  const overviewBySite = await getOverviewDataBySite(detectionsBySites)
  const overviewByTime = await getOverviewDataByTime(totalSummaries)
  const overviewBySpecies = await getOverviewDataBySpecies(totalSummaries, isLocationRedacted)
  const sites = rawSites.filter(site => {
    return filter.siteIds.indexOf(site.siteId) !== 1
  })
  return {
    isLocationRedacted,
    sites,
    overviewBySite,
    overviewByTime,
    overviewBySpecies
  }
}

const getOverviewDataBySite = async (detectionsBySites: DetectionGroupedBySite): Promise<ActivityOverviewDataBySite> => {
  const summariesBySites = mapValues(detectionsBySites, (detections, siteId) => {
    const totalRecordingCount = getRecordingCount(detections)
    const detectionCount = sum(detections.map(d => d.num_of_recordings))
    const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount
    const siteOccupiedFrequency = detections.length > 0

    return {
      siteId,
      siteName: detections[0].name,
      latitude: detections[0].lat,
      longitude: detections[0].lon,
      detection: detectionCount,
      detectionFrequency: detectionFrequency,
      occupancy: siteOccupiedFrequency
    }
  })
  return summariesBySites
}

const getOverviewDataBySpecies = async (totalSummaries: MockHourlyDetectionSummary[], isLocationRedacted: boolean): Promise<ActivityOverviewDataBySpecies[]> => {
    let detections = totalSummaries
    if (isLocationRedacted) {
      const protectedSpeciesIds = rawSpecies.filter(({ extinctionRisk }) => EXTINCTION_RISK_PROTECTED_CODES.includes(extinctionRisk)).map(({ speciesId }) => speciesId)
      detections = totalSummaries.filter(({ species_id: speciesId }) => !protectedSpeciesIds.includes(speciesId))
    }
    const detectionsBySpecies = groupBy(detections, 'scientific_name')
    const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
    const totalRecordingCount = getRecordingCount(totalSummaries)

    const activityOverviewDataBySpecies: ActivityOverviewDataBySpecies[] = []
    for (const [scientificName, speciesDetectedDetections] of Object.entries(detectionsBySpecies)) {
      const detectionCount = calculateDetectionActivity(speciesDetectedDetections)
      const detectionFrequency = calculateDetectionFrequencyActivity(speciesDetectedDetections, totalRecordingCount)
      const occupiedSites = new Set(speciesDetectedDetections.map(d => d.stream_id)).size
      const occupancyNaive = calculateOccupancyActivity(speciesDetectedDetections, totalSiteCount)

      activityOverviewDataBySpecies.push({
        scientificName,
        commonName: rawSpecies.find((raw) => raw?.scientificName === scientificName)?.commonName ?? '',
        taxon: speciesDetectedDetections[0].taxon,
        detectionCount,
        detectionFrequency,
        occupiedSites,
        occupancyNaive
      })
    }

    return activityOverviewDataBySpecies
  }

const getRecordingCount = (detections: MockHourlyDetectionSummary[]): number => {
  return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
}

const calculateDetectionActivity = (detections: MockHourlyDetectionSummary[]): number => {
  return sum(detections.map(d => d.num_of_recordings))
}

const calculateDetectionFrequencyActivity = (detections: MockHourlyDetectionSummary[], totalRecordingCount: number): number => {
  const detectionCount = sum(detections.map(d => d.num_of_recordings))
  return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
}

const calculateOccupancyActivity = (detections: MockHourlyDetectionSummary[], totalSiteCount: number): number => {
  const occupiedCount = new Set(detections.map(d => d.stream_id)).size
  return occupiedCount === 0 ? 0 : occupiedCount / totalSiteCount
}

const getOverviewDataByTime = async (totalSummaries: MockHourlyDetectionSummary[]): Promise<ActivityOverviewDataByTime> => {
  const totalRecordingCount = getRecordingCount(totalSummaries)
  return calculateOverviewDataByTime(totalRecordingCount, totalSummaries)
}

const calculateOverviewDataByTime = (totalRecordingCount: number, speciesSummaries: MockHourlyDetectionSummary[]): ActivityOverviewDataByTime => {
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
