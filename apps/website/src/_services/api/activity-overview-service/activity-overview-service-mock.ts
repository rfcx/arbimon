import { groupBy, mapValues, sum } from 'lodash-es'

import { MockHourlyDetectionSummary, rawDetections, simulateDelay } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { ActicvityOverviewDataBySite, ActivityOverviewData, ActivityOverviewDataBySpecies, ActivityOverviewDataByTime, DetectionGroupByDetectionKey, DetectionGroupedBySiteAndTaxon } from '~/api/activity-overview-service'
import { DatasetParameters, filterMocksByParameters } from '~/filters'

export class ActivityOverviewService {
  constructor (
    private readonly rawHourlySpeciesSummaries: MockHourlyDetectionSummary[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityOverviewData (dataset: DatasetParameters): Promise<ActivityOverviewData> {
    const totalSummaries = filterMocksByParameters(this.rawHourlySpeciesSummaries, dataset)
    const detectionsBySites = groupBy(totalSummaries, 'stream_id')
    const detectionsByTaxon: DetectionGroupByDetectionKey = groupBy(totalSummaries, 'taxon')
    const overviewBySite = await this.getOverviewDataBySite(detectionsByTaxon, detectionsBySites)
    const overviewByTime = await this.getOverviewDataByTime(totalSummaries, detectionsByTaxon)
    const overviewBySpecies = await this.getOverviewDataBySpecies(totalSummaries)

    return await simulateDelay({ ...dataset, overviewBySite, overviewByTime, overviewBySpecies }, this.delay)
  }

  getRecordingCount (detections: MockHourlyDetectionSummary[]): number {
    return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
  }

  async getOverviewDataBySite (detectionsByTaxon: DetectionGroupByDetectionKey, detectionsBySites: DetectionGroupByDetectionKey): Promise<ActicvityOverviewDataBySite> {
    const taxonClasses = Object.keys(detectionsByTaxon)

    const summariesEachTaxonBySite: DetectionGroupedBySiteAndTaxon = mapValues(detectionsByTaxon, (detection) => {
      const groupedSites = groupBy(detection, 'stream_id')
      return groupedSites
    })

    // Calculate all have detection sites
    const summariesBySites = mapValues(summariesEachTaxonBySite, (siteWithDetections, siteId) => {
      return mapValues(siteWithDetections, (detections) => {
        const siteTotalRecordingCount = this.getRecordingCount(detections)

        const siteDetectionCount = sum(detections.map(d => d.num_of_recordings))
        const siteDetectionFrequency = siteTotalRecordingCount === 0 ? 0 : siteDetectionCount / siteTotalRecordingCount
        const siteOccupiedFrequency = detections.length > 0

        return {
          siteId,
          siteName: detections[0].name,
          latitude: detections[0].lat,
          longitude: detections[0].lon,
          detection: siteDetectionCount,
          detectionFrequency: siteDetectionFrequency,
          occupancy: siteOccupiedFrequency
        }
      })
    })

    // Add non detection sites
    for (const taxon of taxonClasses) {
      const summariesByTaxonGroup = summariesBySites[taxon]
      for (const [siteId, values] of Object.entries(detectionsBySites)) {
        if (summariesByTaxonGroup[siteId] === undefined) {
          summariesByTaxonGroup[siteId] = {
            siteId,
            siteName: values[0].name,
            latitude: values[0].lat,
            longitude: values[0].lon,
            detection: 0,
            detectionFrequency: 0,
            occupancy: false
          }
        }
      }
    }

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

  async getOverviewDataByTime (totalSummaries: MockHourlyDetectionSummary[], detectionsByTaxon: DetectionGroupByDetectionKey): Promise<ActivityOverviewDataByTime[]> {
    const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
    const totalRecordingCount = this.getRecordingCount(totalSummaries)

    const overviewByTime: ActivityOverviewDataByTime[] = []
    for (const taxonClass of Object.keys(detectionsByTaxon)) {
      const speciesSummaries = detectionsByTaxon[taxonClass]
      const eachTaxonByTime = this.calculateOverviewDataByTime(totalSiteCount, totalRecordingCount, speciesSummaries)
      overviewByTime.push(eachTaxonByTime)
    }

    return overviewByTime
  }

  calculateOverviewDataByTime (totalSiteCount: number, totalRecordingCount: number, speciesSummaries: MockHourlyDetectionSummary[]): ActivityOverviewDataByTime {
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

  async getOverviewDataBySpecies (totalSummaries: MockHourlyDetectionSummary[]): Promise<ActivityOverviewDataBySpecies[]> {
    const detectionsBySpecies = groupBy(totalSummaries, 'scientific_name')
    const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
    const totalRecordingCount = this.getRecordingCount(totalSummaries)

    const activityOverviewDataBySpecies: ActivityOverviewDataBySpecies[] = []
    for (const [speciesName, speciesDetectedDetections] of Object.entries(detectionsBySpecies)) {
      const detectionCount = this.calculateDetectionActivity(speciesDetectedDetections)
      const detectionFrequency = this.calculateDetectionFrequencyActivity(speciesDetectedDetections, totalRecordingCount)
      const occupiedSites = new Set(speciesDetectedDetections.map(d => d.stream_id)).size
      const occupancyNaive = this.calculateOccupancyActivity(speciesDetectedDetections, totalSiteCount)

      activityOverviewDataBySpecies.push({
        speciesName,
        taxonomyClass: speciesDetectedDetections[0].taxon,
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
