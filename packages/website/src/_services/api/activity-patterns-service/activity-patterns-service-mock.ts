import { sum } from 'lodash'

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
    const detectionCount = sum(detections.map(d => d.num_of_recordings))

    const totalSiteCount = new Set(totalDetections.map(d => d.stream_id)).size
    const occupiedSiteCount = new Set(detections.map(d => d.stream_id)).size

    const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount
    const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

    return await simulateDelay({ ...dataset, totalSiteCount, totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency }, this.delay)
  }
}

export const activityPatternsService = new ActivityPatternsService(getRawDetections())
