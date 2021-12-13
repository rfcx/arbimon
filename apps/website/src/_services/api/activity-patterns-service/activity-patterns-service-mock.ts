import { groupBy, mapValues, sum } from 'lodash-es'

import { MockHourlyDetectionSummary, rawDetections, simulateDelay } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { DatasetParameters, filterMocksByParameters, filterMocksBySpecies } from '~/filters'
import { ActivityPatternsData, ActivityPatternsDataBySite, ActivityPatternsDataByTime } from './types'

export class ActivityPatternsService {
  constructor (
    private readonly rawHourlySpeciesSummaries: MockHourlyDetectionSummary[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityPatternsData (dataset: DatasetParameters, speciesId: number): Promise<ActivityPatternsData> {
    // Filtering
    const totalSummaries = filterMocksByParameters(this.rawHourlySpeciesSummaries, dataset)
    const speciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)

    // Metrics
    const totalRecordingCount = this.getRecordingCount(totalSummaries)
    const detectionCount = sum(speciesSummaries.map(d => d.num_of_recordings)) // 1 recording = 1 detection
    const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount

    const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
    const occupiedSiteCount = new Set(speciesSummaries.map(d => d.stream_id)).size
    const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

    // By site
    const activityBySite = this.getActivityDataBySite(totalSummaries, speciesId)
    const activityByTime = this.getActvityDataByTime(totalSummaries, speciesId)

    return await simulateDelay({ ...dataset, totalSiteCount, totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency, activityBySite, activityByTime }, this.delay)
  }

  getRecordingCount (detections: MockHourlyDetectionSummary[]): number {
    return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
  }

  getActivityDataBySite (totalSummaries: MockHourlyDetectionSummary[], speciesId: number): ActivityPatternsDataBySite {
    const summariesBySite: { [siteId: string]: MockHourlyDetectionSummary[] } = groupBy(totalSummaries, 'stream_id')
    return mapValues(summariesBySite, (totalSummaries, siteId) => {
      const siteTotalRecordingCount = this.getRecordingCount(totalSummaries)

      const siteSpeciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)
      const siteDetectionCount = sum(siteSpeciesSummaries.map(d => d.num_of_recordings))
      const siteDetectionFrequency = siteTotalRecordingCount === 0 ? 0 : siteDetectionCount / siteTotalRecordingCount

      const siteOccupied = siteSpeciesSummaries.length > 0

      return {
        siteId,
        siteName: totalSummaries[0].name,
        latitude: totalSummaries[0].lat,
        longitude: totalSummaries[0].lon,
        siteDetectionCount,
        siteDetectionFrequency,
        siteOccupied
      }
    })
  }

  calculateDetectionActivity (detections: MockHourlyDetectionSummary[]): number {
    return sum(detections.map(d => d.num_of_recordings))
  }

  calculateDetectionFrequencyActivity (detections: MockHourlyDetectionSummary[], totalRecordingCount: number): number {
    const detectionCount = sum(detections.map(d => d.num_of_recordings))
    return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
  }

  calculateOccupancyActivity (detections: MockHourlyDetectionSummary[], totalSiteCount: number): number {
    const occupiedCount = new Set(detections.map(d => d.stream_id)).size
    return occupiedCount === 0 ? 0 : occupiedCount / totalSiteCount
  }

  getActvityDataByTime (totalSummaries: MockHourlyDetectionSummary[], speciesId: number): ActivityPatternsDataByTime {
    const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
    const totalRecordingCount = this.getRecordingCount(totalSummaries)

    const speciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)

    const hourGrouped = groupByNumber(speciesSummaries, d => d.hour)
    const hour = {
      detection: mapValues(hourGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(hourGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount)),
      occupancy: mapValues(hourGrouped, (data) => this.calculateOccupancyActivity(data, totalSiteCount))
    }

    const dayGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).date())
    const day = {
      detection: mapValues(dayGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(dayGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount)),
      occupancy: mapValues(dayGrouped, (data) => this.calculateOccupancyActivity(data, totalSiteCount))
    }

    const monthGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).month() + 1)
    const month = {
      detection: mapValues(monthGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(monthGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount)),
      occupancy: mapValues(monthGrouped, (data) => this.calculateOccupancyActivity(data, totalSiteCount))
    }

    const yearGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).year())
    const year = {
      detection: mapValues(yearGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(yearGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount)),
      occupancy: mapValues(yearGrouped, (data) => this.calculateOccupancyActivity(data, totalSiteCount))
    }

    const quarterGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).quarter())
    const quarter = {
      detection: mapValues(quarterGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(quarterGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount)),
      occupancy: mapValues(quarterGrouped, (data) => this.calculateOccupancyActivity(data, totalSiteCount))
    }

    return { hour, day, month, year, quarter }
  }
}

export const activityPatternsService = new ActivityPatternsService(rawDetections)
