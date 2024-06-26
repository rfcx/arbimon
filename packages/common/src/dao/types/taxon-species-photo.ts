import { type AttributeTypes, attributes } from '../type-helpers'
import { type Source } from './source'

export interface TaxonSpeciesPhoto {
  taxonSpeciesId: number
  source: Source
  photoUrl: string
  photoCaption: string
  photoAuthor: string
  photoLicense: string
  photoLicenseUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_TAXON_SPECIES_PHOTO = attributes<TaxonSpeciesPhoto>()({
  light: ['photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl'],
  full: ['taxonSpeciesId', 'photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl']
})

export type TaxonSpeciesPhotoTypes = AttributeTypes<TaxonSpeciesPhoto, typeof ATTRIBUTES_TAXON_SPECIES_PHOTO>
