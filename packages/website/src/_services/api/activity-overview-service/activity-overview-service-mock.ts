import { groupBy, mapValues, sum } from 'lodash'

import { DatasetDefinition } from '~/api'
import { ActicvityOverviewDataBySite, ActivityOverviewData, DetectionGroupByDetectionKey, DetectionGroupedBySiteAndTaxon } from '~/api/activity-overview-service'
import { ApiHourlySpeciesSummary, filterByDataset, getRawDetections, simulateDelay } from '~/api-helpers/mock'

export class ActivityOverviewService {
  constructor (
    private readonly rawHourlySpeciesSummaries: ApiHourlySpeciesSummary[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityOverviewData (dataset: DatasetDefinition): Promise<ActivityOverviewData> {
    const totalSummaries = filterByDataset(this.rawHourlySpeciesSummaries, dataset)
    const detectionsBySites = groupBy(totalSummaries, 'stream_id')
    const detectionsByTaxon: DetectionGroupByDetectionKey = groupBy(totalSummaries, 'taxon')
    const overviewBySite = await this.getOverviewDataBySite(detectionsByTaxon, detectionsBySites)

    return await simulateDelay({ ...dataset, overviewBySite }, this.delay)
  }

  getRecordingCount (detections: ApiHourlySpeciesSummary[]): number {
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
}

export const activityOverviewService = new ActivityOverviewService(getRawDetections())
