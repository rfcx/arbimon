import { Species } from './species'

export interface PredictedOccupancyMap {
  title: string
  url: string
}

export interface ProjectSpeciesRouteResponse {
  speciesInformation: Species
  predictedOccupancyMaps: PredictedOccupancyMap[]
}
