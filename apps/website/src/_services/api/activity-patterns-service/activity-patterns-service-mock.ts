import { groupBy, mapValues, sum } from 'lodash-es'

import { MockHourlyDetectionSummary, rawDetections, simulateDelay } from '@rfcx-bio/common/mock-data'
import { criticallyEndangeredSpeciesIds } from '@rfcx-bio/common/mock-data/critically-endangered-species'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { ActivityPatternsDataByExport } from '~/api/activity-patterns-service'
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
    const activityByTime = this.getActivityDataByTime(totalSummaries, speciesId)
    const activityByExport = this.getActivityDataExport(totalSummaries, speciesId, activityBySite)

    return await simulateDelay({ ...dataset, totalSiteCount, totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency, activityBySite, activityByTime, activityByExport }, this.delay)
  }

  getRecordingCount (detections: MockHourlyDetectionSummary[]): number {
    return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
  }

  getActivityDataBySite (totalSummaries: MockHourlyDetectionSummary[], speciesId: number): ActivityPatternsDataBySite {
    // Redact critically endangered species
    if (criticallyEndangeredSpeciesIds.has(speciesId)) {
      return {
        1: {
          siteId: 1,
          siteName: 'location data redacted',
          latitude: 0,
          longitude: 0,
          siteDetectionCount: 0,
          siteDetectionFrequency: 0,
          siteOccupied: false
        }
      }
    }

    const summariesBySite: { [siteId: string]: MockHourlyDetectionSummary[] } = groupBy(totalSummaries, 'stream_id')
    return mapValues(summariesBySite, (siteSummaries, siteId) => {
      const siteTotalRecordingCount = this.getRecordingCount(siteSummaries)

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

  calculateDetectionActivity (detections: MockHourlyDetectionSummary[]): number {
    return sum(detections.map(d => d.num_of_recordings))
  }

  calculateDetectionFrequencyActivity (detections: MockHourlyDetectionSummary[], totalRecordingCount: number): number {
    const detectionCount = sum(detections.map(d => d.num_of_recordings))
    return detectionCount === 0 ? 0 : detectionCount / totalRecordingCount
  }

  getActivityDataByTime (totalSummaries: MockHourlyDetectionSummary[], speciesId: number): ActivityPatternsDataByTime {
    const totalRecordingCount = this.getRecordingCount(totalSummaries)
    const speciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)

    const hourGrouped = groupByNumber(speciesSummaries, d => d.hour)
    const dayGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).isoWeekday() - 1)
    const monthGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).month())

    return {
      hourOfDay: {
        detection: mapValues(hourGrouped, this.calculateDetectionActivity),
        detectionFrequency: mapValues(hourGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
      },
      dayOfWeek: {
        detection: mapValues(dayGrouped, this.calculateDetectionActivity),
        detectionFrequency: mapValues(dayGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
      },
      monthOfYear: {
        detection: mapValues(monthGrouped, this.calculateDetectionActivity),
        detectionFrequency: mapValues(monthGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
      }
    }
  }

  getActivityDataExport (totalSummaries: MockHourlyDetectionSummary[], speciesId: number, sites: ActivityPatternsDataBySite): ActivityPatternsDataByExport {
    const totalRecordingCount = this.getRecordingCount(totalSummaries)
    const speciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)

    const hourGrouped = groupByNumber(speciesSummaries, d => d.hour)
    const monthYearGrouped = groupBy(speciesSummaries, d => dayjs.utc(d.date).format('MM/YYYY'))
    const yearGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).year())

    return {
      hour: {
        detection: mapValues(hourGrouped, this.calculateDetectionActivity),
        detectionFrequency: mapValues(hourGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
      },
      month: {
        detection: mapValues(monthYearGrouped, this.calculateDetectionActivity),
        detectionFrequency: mapValues(monthYearGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
      },
      year: {
        detection: mapValues(yearGrouped, this.calculateDetectionActivity),
        detectionFrequency: mapValues(yearGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
      },
      sites
    }
  }
}

export const activityPatternsService = new ActivityPatternsService(rawDetections)
