import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesRiskRating {
  taxonSpeciesId: number
  taxonSpeciesSourceId: number
  riskRatingId: number
  sourceUrl: string
  riskRatingCustomCode: string
}

export const ATTRIBUTES_TAXON_SPECIES_RISK_RATING: AttributeConstants<TaxonSpeciesRiskRating> = {
  updateOnDuplicate: ['riskRatingId', 'sourceUrl', 'riskRatingCustomCode']
}
