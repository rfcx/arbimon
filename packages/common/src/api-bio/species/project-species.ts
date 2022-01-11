import { Species } from './common'

export interface PredictedOccupancyMap {
  title: string
  url: string
}

export interface ProjectSpeciesRouteResponse {
  speciesInformation: Species
  predictedOccupancyMaps: PredictedOccupancyMap[]
}
