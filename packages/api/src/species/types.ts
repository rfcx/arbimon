export type SpeciesSource = 'IUCN' | 'Wiki'
export type SpeciesCategory = 'NE' | 'DD' | 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX'

export interface SpeciesInformation {
  description: string
  source_url: string | undefined
  source_type: string
}

export interface SpeciesExternalLink {
  title: string
  source_url: string | undefined
  source_type: string
}

export interface Species {
  species_id: number
  scientific_name: string
  taxon_id: number
  taxon: string
  information?: SpeciesInformation | undefined
  external_links?: SpeciesExternalLink[]
  iucn_rank?: SpeciesCategory
  thumbnail_image?: string
}
