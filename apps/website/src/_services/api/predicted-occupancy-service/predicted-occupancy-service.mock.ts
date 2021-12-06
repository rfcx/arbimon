import { rawPredictedOccupancyFilenames } from './raw-predicted-occupancy-filenames'
import { GetPredictedOccupancyMaps, PredictedOccupancyMap } from './types'

export const getPredictedOccupancyMaps: GetPredictedOccupancyMaps = async (speciesSlug: string): Promise<PredictedOccupancyMap[]> => {
  // Check slug exists
  if (!speciesSlug) return []

  // Return mock data
  const bioApiHost: string = import.meta.env.VITE_BIO_API_HOST // TODO ??? - Fix @typescript/eslint so it picks up vite-env.d.ts
  return rawPredictedOccupancyFilenames
    .filter(filename => filename.startsWith(speciesSlug))
    .map(name => ({
      title: name,
      url: `${bioApiHost}/projects/123/predicted-occupancy/${name}`
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}
