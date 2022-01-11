import { Species } from 'api-bio/species/species'

export interface PredictedOccupancyMap {
  title: string
  url: string
}

export interface ProjectSpeciesRouteResponse {
  speciesInformation: Species
  predictedOccupancyMaps: PredictedOccupancyMap[]
}
