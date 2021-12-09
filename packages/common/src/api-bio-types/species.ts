import { ExtinctionRiskCode } from '../iucn'

export const SPECIES_SOURCE_IUCN = 'IUCN'
export const SPECIES_SOURCE_WIKI = 'Wiki'

const SPECIES_SOURCES = <const>[SPECIES_SOURCE_IUCN, SPECIES_SOURCE_WIKI]
export type SpeciesSource = typeof SPECIES_SOURCES[number]

export interface SpeciesInformation {
  description: string
  sourceUrl: string | undefined
  sourceType: SpeciesSource
  sourceCite?: string
}

export interface SpeciesExternalLink {
  title: string
  sourceUrl: string | undefined
  sourceType: SpeciesSource
}

export interface Species {
  speciesId: number
  speciesSlug: string
  scientificName: string
  commonName: string
  extinctionRisk: ExtinctionRiskCode
  thumbnailImageUrl?: string
  taxonId: number
  taxon: string
  information?: SpeciesInformation | undefined
  externalLinks?: SpeciesExternalLink[]
}
