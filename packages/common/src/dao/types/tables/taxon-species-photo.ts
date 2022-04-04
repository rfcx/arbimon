import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesPhoto {
  taxonSpeciesId: number
  taxonSpeciesSourceId: number
  order: number
  sourceUrl: string
  photoUrl: string
  license: string
  caption: string
  author: string
}

export type TaxonSpeciesPhotoLight = Pick<TaxonSpeciesPhoto,
  'sourceUrl' |
  'photoUrl' |
  'license' |
  'caption' |
  'author'
>

export const ATTRIBUTES_TAXON_SPECIES_PHOTO: AttributeConstants<TaxonSpeciesPhoto> = {
  pks: ['taxonSpeciesId', 'taxonSpeciesSourceId', 'order'],
  updateOnDuplicate: ['sourceUrl', 'photoUrl', 'license', 'caption', 'author'],
  light: ['sourceUrl', 'photoUrl', 'license', 'caption', 'author'],
  full: ['taxonSpeciesId', 'taxonSpeciesSourceId', 'order', 'sourceUrl', 'photoUrl', 'license', 'caption', 'author']
}
