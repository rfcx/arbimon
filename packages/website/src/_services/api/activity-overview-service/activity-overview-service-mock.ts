import { groupBy, mapValues, sum } from 'lodash'

import { DatasetDefinition } from '~/api'
import { ActicvityOverviewDataBySite, ActivityOverviewData, DetectionGroupByTaxonClass, DetectionGroupedBySiteAndTaxon } from '~/api/activity-overview-service'
import { ApiHourlySpeciesSummary, filterByDataset, getRawDetections, simulateDelay } from '~/api-helpers/mock'

export class ActivityOverviewService {
  constructor (
    private readonly rawHourlySpeciesSummaries: ApiHourlySpeciesSummary[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityOverviewData (dataset: DatasetDefinition): Promise<ActivityOverviewData> {
    const totalSummaries = filterByDataset(this.rawHourlySpeciesSummaries, dataset)
    const detectionsByTaxon: DetectionGroupByTaxonClass = groupBy(totalSummaries, 'taxon')
    const overviewBySite = await this.getOverviewDataBySite(detectionsByTaxon)

    return await simulateDelay({ ...dataset, overviewBySite }, this.delay)
  }

  getRecordingCount (detections: ApiHourlySpeciesSummary[]): number {
    return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
  }

  async getOverviewDataBySite (detectionsByTaxon: DetectionGroupByTaxonClass): Promise<ActicvityOverviewDataBySite> {
    const summariesEachTaxonBySite: DetectionGroupedBySiteAndTaxon = mapValues(detectionsByTaxon, (detection) => {
      const groupedSites = groupBy(detection, 'stream_id')
      return groupedSites
    })

    return mapValues(summariesEachTaxonBySite, (siteWithDetections, siteId) => {
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
  }
}

export const activityOverviewService = new ActivityOverviewService(getRawDetections())
