import { DatasetDefinition } from '~/api/types'
import { filterByDataset, filterBySpecies, getRawDetections, simulateDelay } from '~/api-helpers/mock'
import { ActivityPatternsData } from '.'

export const getActivityPatternsData = async (dataset: DatasetDefinition, speciesId: number): Promise<ActivityPatternsData> => {
  const totalRecordings = filterByDataset(getRawDetections(), dataset)
  const totalRecordingCount = totalRecordings.length

  const detections = filterBySpecies(totalRecordings, speciesId)
  const detectionCount = detections.length

  const totalSiteCount = new Set(totalRecordings.map(d => d.stream_id)).size
  const occupiedSiteCount = new Set(detections.map(d => d.stream_id)).size

  const detectionFrequency = totalRecordingCount === 0 ? 0 : detections.map(d => d.detection_frequency).reduce((a, b) => a + b, 0) / totalRecordingCount
  const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

  return await simulateDelay({ totalSiteCount, totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency })
}
