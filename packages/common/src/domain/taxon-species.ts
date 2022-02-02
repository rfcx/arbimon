// TODO: Define a "standard" risk rating & map IUCN ratings to it
import { ExtinctionRiskCode } from '../iucn'

// TODO: Migrate frontend code to TaxonSpecies & eliminate Species, etc.
export interface TaxonSpecies {
  id: number
  idArbimon: number
  slug: string
  taxonClassId: number
  scientificName: string
  commonName: string
  extinctionRiskRating: string
  extinctionRiskRatingSource: string
  description: string
  descriptionSource: string
  descriptionSourceUrl: string
  callProjectId: number
  callSiteId: number
  callType: string
  callRecordedAt: Date
  callTimezone: string
  callMediaWavUrl: string
  callMediaSpecUrl: string
  photoUrl: string
  photoCaption: string
  photoAuthor: string
  photoLicense: string
  photoLicenseUrl: string
}

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
  mediaWavUrl: string
  mediaSpecUrl: string
  songType: string
  recordedAt: string
  timezone: string
  projectName: string
  siteName: string
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
  imageCaption: string
  thumbnailImageUrl?: string
  speciesCall?: SpeciesCall
}

export type SpeciesLight = Pick<Species, 'speciesId' | 'speciesSlug' | 'scientificName' | 'commonName' | 'taxon'>
