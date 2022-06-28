import { attributes, AttributeTypes } from '../type-helpers'
import { Source } from './source'

export interface TaxonSpeciesPhoto {
  taxonSpeciesId: number
  source: Source
  photoUrl: string
  photoCaption: string
  photoAuthor: string
  photoLicense: string
  photoLicenseUrl?: string
}

export const ATTRIBUTES_TAXON_SPECIES_PHOTO = attributes<TaxonSpeciesPhoto>()({
  light: ['photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl'],
  full: ['taxonSpeciesId', 'photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl']
})

export type TaxonSpeciesPhotoTypes = AttributeTypes<TaxonSpeciesPhoto, typeof ATTRIBUTES_TAXON_SPECIES_PHOTO>
