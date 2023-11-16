export interface DashboardSpecies {
  slug: string
  taxonSlug: string
  riskId: number
  scientificName: string
  commonName?: string
  photoUrl?: string
}

export interface RiskRatingUi {
  code: string
  label: string
  color: string
}

export interface HighlightedSpecies {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  photoUrl: string
  riskRating: RiskRatingUi
}

export interface LocationProjectSpecies {
  locationProjectId: number
  taxonSpeciesId: number
  highlightedOrder: number
  description: string
  riskRatingLocalLevel: number
  riskRatingLocalCode: string
  riskRatingLocalSource: string
}
