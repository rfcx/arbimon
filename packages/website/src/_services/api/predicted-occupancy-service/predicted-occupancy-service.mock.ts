import { getAllSpecies } from '~/api/species-service'
import { rawPredictedOccupancyFilenames } from './raw-predicted-occupancy-filenames'

export interface PredictedOccupancyMap {
  title: string
  url: string
}

export const getPredictedOccupancyMaps = async (speciesId?: number): Promise<PredictedOccupancyMap[]> => {
  // Check ID exists
  if (speciesId === undefined || isNaN(speciesId)) return []

  // Check species exists
  const allSpecies = await getAllSpecies()
  const species = allSpecies.find(s => s.speciesId === speciesId)
  if (!species) return []

  // Return mock data
  return rawPredictedOccupancyFilenames
    .filter(filename => filename.startsWith(species.speciesSlug))
    .map(name => ({
      title: name,
      url: `${import.meta.env.VITE_BIO_API_HOST}/activity-patterns/predicted-occupancy/${name}.png`
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}
