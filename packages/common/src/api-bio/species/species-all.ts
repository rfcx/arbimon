import { Species } from '../../domain'

// Request
// export interface SpeciesAllParams {}

export const speciesAllRoute = '/species'

export const speciesAllGeneratedUrl = (): string => '/species'

// Response
export interface SpeciesAllResponse {
  species: Species[]
}
