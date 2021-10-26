import { DatasetDefinition } from '~/api/types'
import { filterByDataset, filterBySpecies, getRawDetections, simulateDelay } from '~/api-helpers/mock'
import { ActivityPatternsData } from '.'

export const getActivityPatternsData = async (dataset: DatasetDefinition, speciesId?: number): Promise<ActivityPatternsData> => {
  if (speciesId === undefined) {
    return await simulateDelay({
      detections: 0,
      detectionFrequency: 0,
      occupancy: 0,
      occupancyFrequency: 0
    })
  }

  const detectionsTotal = filterByDataset(getRawDetections(), dataset)
  const detectionsOfSpecies = filterBySpecies(detectionsTotal, speciesId)

  const sites = new Set(detectionsTotal.map(d => d.stream_id)).size
  const sitesWithThisSpecies = new Set(detectionsOfSpecies.map(d => d.stream_id)).size

  const detectionFrequency = detectionsOfSpecies.map(d => d.detection_frequency).reduce((a, b) => a + b, 0) / sites
  const occupancyFrequency = sitesWithThisSpecies / sites

  return await simulateDelay({
    detections: detectionsOfSpecies.length,
    detectionFrequency: isNaN(detectionFrequency) ? 0 : detectionFrequency,
    occupancy: sitesWithThisSpecies,
    occupancyFrequency: isNaN(occupancyFrequency) ? 0 : occupancyFrequency
  })
}
