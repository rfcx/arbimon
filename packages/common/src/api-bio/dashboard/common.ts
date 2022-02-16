import { ExtinctionRiskCode } from '../../iucn'

export interface DashboardSpecies {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  extinctionRisk?: ExtinctionRiskCode // TODO: Delete this
  riskId?: number // TODO: Make this required
  photoUrl?: string
}
