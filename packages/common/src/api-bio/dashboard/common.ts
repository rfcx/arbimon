import { ExtinctionRiskCode } from '../../iucn'

export interface DashboardSpecies {
  speciesId: number
  speciesSlug: string
  scientificName: string
  commonName: string
  extinctionRisk: ExtinctionRiskCode
  taxon: string
  thumbnailImageUrl?: string
}
