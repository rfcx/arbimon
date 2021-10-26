import { DatasetDefinition } from '~/api/types'
import { ApiDetection, filterByDataset, filterBySpecies, getRawDetections, simulateDelay } from '~/api-helpers/mock'
import { ActivityPatternsData } from '.'

export class ActivityPatternsService {
  constructor (
    private readonly rawDetections: ApiDetection[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityPatternsData (dataset: DatasetDefinition, speciesId: number): Promise<ActivityPatternsData> {
    const totalDetections = filterByDataset(this.rawDetections, dataset)
    const totalRecordingCount = new Set(totalDetections.map(d => `${d.date}-${d.hour}`)).size * 12

    const detections = filterBySpecies(totalDetections, speciesId)
    const detectionCount = detections.length

    const totalSiteCount = new Set(totalDetections.map(d => d.stream_id)).size
    const occupiedSiteCount = new Set(detections.map(d => d.stream_id)).size

    const detectionFrequency = totalRecordingCount === 0 ? 0 : detections.map(d => d.detection_frequency).reduce((a, b) => a + b, 0) / totalRecordingCount
    const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

    return await simulateDelay({ totalSiteCount, totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency }, this.delay)
  }
}

export const activityPatternsService = new ActivityPatternsService(getRawDetections())
