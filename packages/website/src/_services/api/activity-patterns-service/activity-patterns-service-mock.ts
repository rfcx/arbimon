import { groupBy, mapValues, sum } from 'lodash'

import { DatasetDefinition } from '~/api/types'
import { ApiHourlySpeciesSummary, filterByDataset, filterBySpecies, getRawDetections, simulateDelay } from '~/api-helpers/mock'
import { ActivityPatternsData, ActivityPatternsDataBySite } from '.'

export class ActivityPatternsService {
  constructor (
    private readonly rawHourlySpeciesSummaries: ApiHourlySpeciesSummary[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityPatternsData (dataset: DatasetDefinition, speciesId: number): Promise<ActivityPatternsData> {
    // Filtering
    const totalSummaries = filterByDataset(this.rawHourlySpeciesSummaries, dataset)
    const speciesSummaries = filterBySpecies(totalSummaries, speciesId)

    // Metrics
    const totalRecordingCount = this.getRecordingCount(totalSummaries)
    const detectionCount = sum(speciesSummaries.map(d => d.num_of_recordings)) // 1 recording = 1 detection
    const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount

    const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
    const occupiedSiteCount = new Set(speciesSummaries.map(d => d.stream_id)).size
    const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

    // By site
    const activityBySite = this.getActivityDataBySite(totalSummaries, speciesId)

    return await simulateDelay({ ...dataset, totalSiteCount, totalRecordingCount, detectionCount: detectionCount, detectionFrequency: detectionFrequency, occupiedSiteCount, occupiedSiteFrequency, activityBySite }, this.delay)
  }

  getRecordingCount (detections: ApiHourlySpeciesSummary[]): number {
    return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
  }

  getActivityDataBySite (totalSummaries: ApiHourlySpeciesSummary[], speciesId: number): ActivityPatternsDataBySite {
    const summariesBySite: { [siteId: string]: ApiHourlySpeciesSummary[] } = groupBy(totalSummaries, 'stream_id')
    return mapValues(summariesBySite, (totalSummaries, siteId) => {
      const siteTotalRecordingCount = this.getRecordingCount(totalSummaries)

      const siteSpeciesSummaries = filterBySpecies(totalSummaries, speciesId)
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
}

export const activityPatternsService = new ActivityPatternsService(getRawDetections())
