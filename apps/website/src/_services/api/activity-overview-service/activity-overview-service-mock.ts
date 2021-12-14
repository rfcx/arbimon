import { groupBy, mapValues, sum } from 'lodash-es'

import { MockHourlyDetectionSummary, rawDetections, rawSpecies, simulateDelay } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { ActicvityOverviewDataBySite, ActivityOverviewData, ActivityOverviewDataBySpecies, ActivityOverviewDataByTime, DetectionGroupedBySite } from '~/api/activity-overview-service'
import { DatasetParameters, filterMocksByParameters } from '~/filters'

export class ActivityOverviewService {
  constructor (
    private readonly rawHourlySpeciesSummaries: MockHourlyDetectionSummary[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityOverviewData (dataset: DatasetParameters): Promise<ActivityOverviewData> {
    const totalSummaries = filterMocksByParameters(this.rawHourlySpeciesSummaries, dataset)
    const detectionsBySites = groupBy(totalSummaries, 'stream_id')
    const overviewBySite = await this.getOverviewDataBySite(detectionsBySites)
    const overviewByTime = await this.getOverviewDataByTime(totalSummaries)
    const overviewBySpecies = await this.getOverviewDataBySpecies(totalSummaries)

    return await simulateDelay({ ...dataset, overviewBySite, overviewByTime, overviewBySpecies }, this.delay)
  }

  getRecordingCount (detections: MockHourlyDetectionSummary[]): number {
    return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
  }

  async getOverviewDataBySite (detectionsBySites: DetectionGroupedBySite): Promise<ActicvityOverviewDataBySite> {
    const summariesBySites = mapValues(detectionsBySites, (detections, siteId) => {
      const totalRecordingCount = this.getRecordingCount(detections)
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

  async getOverviewDataByTime (totalSummaries: MockHourlyDetectionSummary[]): Promise<ActivityOverviewDataByTime> {
    const totalRecordingCount = this.getRecordingCount(totalSummaries)
    return this.calculateOverviewDataByTime(totalRecordingCount, totalSummaries)
  }

  calculateOverviewDataByTime (totalRecordingCount: number, speciesSummaries: MockHourlyDetectionSummary[]): ActivityOverviewDataByTime {
    const hourGrouped = groupByNumber(speciesSummaries, d => d.hour)
    const hour = {
      detection: mapValues(hourGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(hourGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
    }

    const dayGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).date())
    const day = {
      detection: mapValues(dayGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(dayGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
    }

    const monthGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).month() + 1)
    const month = {
      detection: mapValues(monthGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(monthGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
    }

    const yearGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).year())
    const year = {
      detection: mapValues(yearGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(yearGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
    }

    const quarterGrouped = groupByNumber(speciesSummaries, d => dayjs.utc(d.date).quarter())
    const quarter = {
      detection: mapValues(quarterGrouped, this.calculateDetectionActivity),
      detectionFrequency: mapValues(quarterGrouped, (data) => this.calculateDetectionFrequencyActivity(data, totalRecordingCount))
    }
    return { hour, day, month, year, quarter }
  }

  async getOverviewDataBySpecies (totalSummaries: MockHourlyDetectionSummary[]): Promise<ActivityOverviewDataBySpecies[]> {
    const detectionsBySpecies = groupBy(totalSummaries, 'scientific_name')
    const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
    const totalRecordingCount = this.getRecordingCount(totalSummaries)

    const activityOverviewDataBySpecies: ActivityOverviewDataBySpecies[] = []
    for (const [scientificName, speciesDetectedDetections] of Object.entries(detectionsBySpecies)) {
      const detectionCount = this.calculateDetectionActivity(speciesDetectedDetections)
      const detectionFrequency = this.calculateDetectionFrequencyActivity(speciesDetectedDetections, totalRecordingCount)
      const occupiedSites = new Set(speciesDetectedDetections.map(d => d.stream_id)).size
      const occupancyNaive = this.calculateOccupancyActivity(speciesDetectedDetections, totalSiteCount)

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
}

export const activityOverviewService = new ActivityOverviewService(rawDetections)
