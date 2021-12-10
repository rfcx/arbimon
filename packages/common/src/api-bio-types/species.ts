import { ExtinctionRiskCode } from '../iucn'

const SPECIES_SOURCES = <const>['IUCN', 'Wiki']
export type SpeciesSource = typeof SPECIES_SOURCES[number]

export const SPECIES_SOURCE_IUCN: SpeciesSource = SPECIES_SOURCES[0]
export const SPECIES_SOURCE_WIKI: SpeciesSource = SPECIES_SOURCES[1]

export interface SpeciesInformation {
  description: string
  sourceUrl: string
  sourceType: SpeciesSource
  sourceCite?: string
}

export interface SpeciesExternalLink {
  title: string
  sourceUrl: string
  sourceType: SpeciesSource
}

export interface Species {
  speciesId: number
  speciesSlug: string
  scientificName: string
  commonName: string
  externalLinks: SpeciesExternalLink[]
  extinctionRisk: ExtinctionRiskCode
  information: SpeciesInformation[]
  taxon: string
  taxonId: number
  thumbnailImageUrl?: string
}
