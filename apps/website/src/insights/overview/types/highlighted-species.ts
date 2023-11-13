import { type RiskRatingUi } from '~/risk-ratings'

export interface HighlightedSpeciesRow {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  photoUrl: string
  riskRating: RiskRatingUi
}
