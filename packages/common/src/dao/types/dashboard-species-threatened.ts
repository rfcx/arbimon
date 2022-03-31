export interface DashboardSpeciesThreatened {
  projectId: number
  taxonSpeciesId: number
  taxonClassSlug: string
  taxonSpeciesSlug: string
  riskRatingId: number
  scientificName: string
  commonName?: string
  photoUrl?: string
}
