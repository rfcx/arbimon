export type SpeciesSource = 'IUCN' | 'Wiki'
export type SpeciesCategory = 'NE' | 'DD' | 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX'

export interface SpeciesInformation {
  description: string
  sourceUrl: string | undefined
  sourceType: SpeciesSource
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
