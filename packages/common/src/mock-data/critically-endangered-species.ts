import { EXTINCTION_RISK_PROTECTED_CODES } from '../iucn'
import { rawSpecies } from './raw-species'

export const criticallyEndangeredSpeciesIds = new Set(
  rawSpecies
    .filter(s => EXTINCTION_RISK_PROTECTED_CODES.includes(s.extinctionRisk))
    .map(s => s.speciesId)
)
