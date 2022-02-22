export interface DashboardSpeciesHighlighted {
  locationProjectId: number
  highlightedOrder: number
  taxonClassSlug: string
  taxonSpeciesSlug: string
  riskRatingIucnId?: number
  scientificName: string
  commonName?: string
  photoUrl?: string
}
