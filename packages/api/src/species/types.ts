export type SpeciesSource = 'IUCN' | 'Wiki'
export type SpeciesCategory = 'NE' | 'NA' | 'DD' | 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'RE' | 'EW' | 'EX'

export const EXTINCT_LIST = ['VU', 'EN', 'CR', 'RE', 'EW', 'EX']

export interface SpeciesInformation {
  description: string
  sourceUrl: string | undefined
  sourceType: string
}

export interface SpeciesExternalLink {
  title: string
  sourceUrl: string | undefined
  sourceType: string
}

export interface Species {
  speciesId: number
  speciesSlug: string
  scientificName: string
  speciesCategory: SpeciesCategory | null
  thumbnailImageUrl?: string
  taxonId: number
  taxon: string
  information?: SpeciesInformation | undefined
  externalLinks?: SpeciesExternalLink[]
}
