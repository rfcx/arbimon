import { groupBy, mapValues, sum } from 'lodash'

import { DatasetDefinition } from '~/api/types'
import { ApiDetection, filterByDataset, filterBySpecies, getRawDetections, simulateDelay } from '~/api-helpers/mock'
import { ActivityPatternsData, DetectionSummary } from '.'

export class ActivityPatternsService {
  constructor (
    private readonly rawDetections: ApiDetection[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityPatternsData (dataset: DatasetDefinition, speciesId: number): Promise<ActivityPatternsData> {
    const totalDetections = filterByDataset(this.rawDetections, dataset)
    const totalRecordingCount = new Set(totalDetections.map(d => `${d.date}-${d.hour}`)).size * 12

    const detections = filterBySpecies(totalDetections, speciesId)
    const detectionCount = sum(detections.map(d => d.num_of_recordings))

    const totalSiteCount = new Set(totalDetections.map(d => d.stream_id)).size
    const occupiedSiteCount = new Set(detections.map(d => d.stream_id)).size

    const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount
    const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

    return await simulateDelay({ ...dataset, totalSiteCount, totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency }, this.delay)
  }

  async getDetectionsBySpecies (dataset: DatasetDefinition, speciesId: number): Promise<DetectionSummary> {
    const totalDetections = filterByDataset(this.rawDetections, dataset)
    const totalRecordingCount = new Set(totalDetections.map(d => `${d.date}-${d.hour}`)).size * 12

    const detections = filterBySpecies(totalDetections, speciesId)
    const detectionsBySite = groupBy(detections, 'stream_id')
    const detectionsSummary = mapValues(detectionsBySite, (value, key) => {
      const detectionCount = sum(value.map(v => v.num_of_recordings))
      return {
        siteId: value[0].stream_id,
        siteName: value[0].name,
        latitude: value[0].lat,
        longitude: value[0].lon,
        speciesId: value[0].species_id,
        scientificName: value[0].scientific_name,
        classId: value[0].taxon_id,
        className: value[0].taxon,
        detections: detectionCount,
        detectionsFrequency: totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount
      }
    })

    return { ...dataset, summary: Object.values(detectionsSummary) }
  }
}

export const activityPatternsService = new ActivityPatternsService(getRawDetections())
