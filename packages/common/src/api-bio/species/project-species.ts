export interface PredictedOccupancyMap {
  title: string
  url: string
}

export interface ProjectSpeciesRouteResponse {
  predictedOccupancyMaps: PredictedOccupancyMap[]
}
