// TODO: Define a "standard" risk rating & map IUCN ratings to it
import { ExtinctionRiskCode } from '../../iucn'

const SPECIES_SOURCES = <const>['IUCN', 'Wiki', 'Project']
export type SpeciesSource = typeof SPECIES_SOURCES[number]

export const SPECIES_SOURCE_IUCN: SpeciesSource = SPECIES_SOURCES[0]
export const SPECIES_SOURCE_WIKI: SpeciesSource = SPECIES_SOURCES[1]
export const SPECIES_SOURCE_PROJECT: SpeciesSource = SPECIES_SOURCES[2]

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

export interface SpeciesCall {
  redirectUrl: string
  mediaWavUrl: string
  mediaSpecUrl: string
  songType: string
  recordedAt: string
  timezone: string
  projectName: string
  siteName: string
}

// TODO: Migrate frontend code to DAO TaxonSpecies & eliminate API Species, etc.
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
  imageCaption: string
  thumbnailImageUrl?: string
  speciesCalls: SpeciesCall[]
}

export type SpeciesLight = Pick<Species, 'speciesId' | 'speciesSlug' | 'scientificName' | 'commonName' | 'taxon'>
