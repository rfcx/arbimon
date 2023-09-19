import { type RiskRatingUi } from '~/risk-ratings'

export interface ThreatenedSpeciesRow {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  photoUrl: string
  riskRating: RiskRatingUi
}
