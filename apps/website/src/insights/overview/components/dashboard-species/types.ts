import { type RiskRatingUi } from '~/risk-ratings'

export interface ThreatenedSpeciesRow {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  photoUrl: string
  riskRating: RiskRatingUi
}

export interface HorizontalStack {
  name: string
  count: number
  color: string
}

export interface Bar {
  name: string
  percentage: number
  width: number
  color: string
}
