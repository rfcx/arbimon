export interface PredictedOccupancyMap {
  title: string
  url: string
}

export type GetPredictedOccupancyMaps = (speciesSlug: string) => Promise<PredictedOccupancyMap[]>
