// TODO: Migrate frontend code to DAO TaxonSpecies & delete this file

const SPECIES_SOURCES = ['IUCN', 'Wiki', 'Project'] as const
/**
 * @deprecated Use TaxonSpecies
 */
export type SpeciesSource = typeof SPECIES_SOURCES[number]

/**
 * @deprecated Use TaxonSpecies
 */
export const SPECIES_SOURCE_IUCN: SpeciesSource = SPECIES_SOURCES[0]
/**
 * @deprecated Use TaxonSpecies
 */
export const SPECIES_SOURCE_WIKI: SpeciesSource = SPECIES_SOURCES[1]
/**
 * @deprecated Use TaxonSpecies
 */
export const SPECIES_SOURCE_PROJECT: SpeciesSource = SPECIES_SOURCES[2]

/**
 * @deprecated Use TaxonSpecies
 */
export interface SpeciesInformation {
  description: string
  sourceUrl: string
  sourceType: SpeciesSource
  sourceCite?: string
}

/**
 * @deprecated Use TaxonSpecies
 */
export interface SpeciesExternalLink {
  title: string
  sourceUrl: string
  sourceType: SpeciesSource
}

/**
 * @deprecated Use TaxonSpecies
 */
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

/**
 * @deprecated Use TaxonSpecies
 */
export interface Species {
  speciesId: number
  speciesSlug: string
  scientificName: string
  commonName: string
  externalLinks: SpeciesExternalLink[]
  extinctionRisk: string
  information: SpeciesInformation[]
  taxon: string
  taxonId: number
  imageCaption: string
  thumbnailImageUrl?: string
  speciesCalls: SpeciesCall[]
}

/**
 * @deprecated Use TaxonSpecies
 */
export type SpeciesLight = Pick<Species, 'speciesId' | 'speciesSlug' | 'scientificName' | 'commonName' | 'taxon'>
