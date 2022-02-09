import { Species } from './types'

// Request
export interface SpeciesOneParams {
  speciesSlug: string
}

export const speciesOneRoute = '/species/:speciesSlug'

export const projectSpeciesOneGeneratedUrl = (params: SpeciesOneParams): string =>
  `/species/${params.speciesSlug}`

// Response
export interface SpeciesOneResponse {
  species: Species
}
