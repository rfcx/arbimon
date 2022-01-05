import { rawSpecies } from './raw-species'

const criticallyEndangeredSpeciesCode = 'CR'

export const criticallyEndangeredSpeciesIds = new Set(
  rawSpecies
    .filter(s => s.extinctionRisk === criticallyEndangeredSpeciesCode)
    .map(s => s.speciesId)
)
