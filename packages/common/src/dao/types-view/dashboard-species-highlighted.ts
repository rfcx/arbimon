export interface DashboardSpeciesHighlighted {
  projectId: number
  highlightedOrder: number
  taxonClassSlug: string
  taxonSpeciesSlug: string
  riskRatingId: number
  scientificName: string
  commonName?: string
  photoUrl?: string
}
