import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesRiskRating {
  taxonSpeciesId: number
  taxonSpeciesSourceId: number
  riskRatingId: number
  sourceUrl: string
  riskRatingCustomCode: string | null
}

export const ATTRIBUTES_TAXON_SPECIES_RISK_RATING: AttributeConstants<TaxonSpeciesRiskRating> = {
}
