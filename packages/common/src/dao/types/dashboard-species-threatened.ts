export interface DashboardSpeciesThreatened {
  locationProjectId: number
  taxonSpeciesId: number
  taxonClassSlug: string
  taxonSpeciesSlug: string
  riskRatingId: number
  scientificName: string
  commonName?: string
  photoUrl?: string
}
