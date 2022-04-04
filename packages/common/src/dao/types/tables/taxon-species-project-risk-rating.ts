import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesProjectRiskRating {
  taxonSpeciesId: number
  projectId: number
  riskRatingId: number
  sourceUrl: string
  sourceName: string
  riskRatingCustomCode: string
}

export const ATTRIBUTES_TAXON_SPECIES_PROJECT_RISK_RATING: AttributeConstants<TaxonSpeciesProjectRiskRating> = {
  updateOnDuplicate: ['riskRatingId', 'sourceUrl', 'sourceName', 'riskRatingCustomCode']
}
