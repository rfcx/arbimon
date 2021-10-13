import { DatasetDefinition } from '@/_services/api/types'
import { filterByDataset, filterBySpecies, getRawDetections, simulateDelay } from '@/_services/api-helpers/mock'
import { ActivityPatternsData } from '.'

export const getActivityPatternsData = async (dataset: DatasetDefinition, speciesId: number): Promise<ActivityPatternsData> => {
  const detectionsTotal = filterByDataset(getRawDetections(), dataset)
  const detectionsOfSpecies = filterBySpecies(detectionsTotal, speciesId)

  const sites = new Set(detectionsTotal.map(d => d.stream_id)).size
  const sitesWithThisSpecies = new Set(detectionsOfSpecies.map(d => d.stream_id)).size

  return await simulateDelay({
    detections: detectionsOfSpecies.length,
    detectionFrequency: detectionsOfSpecies.map(d => d.detection_frequency).reduce((a, b) => a + b, 0) / sites,
    occupancy: sitesWithThisSpecies,
    occupancyFrequency: sitesWithThisSpecies / sites
  })
}
