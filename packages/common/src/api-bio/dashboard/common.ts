import { ExtinctionRiskCode } from '../../iucn'

export interface DashboardSpecies {
  slug: string
  taxonSlug: string
  extinctionRisk: ExtinctionRiskCode
  scientificName: string
  commonName?: string
  photoUrl?: string
}
