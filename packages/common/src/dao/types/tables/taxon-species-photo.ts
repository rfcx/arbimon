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

export type TaxonSpeciesPhotoLight = Pick<TaxonSpeciesPhoto,
  'photoUrl' |
  'photoCaption' |
  'photoAuthor' |
  'photoLicense' |
  'photoLicenseUrl'
>

export const ATTRIBUTES_TAXON_SPECIES_PHOTO: Record<string, Array<keyof TaxonSpeciesPhoto>> = {
  pks: ['taxonSpeciesId'],
  updateOnDuplicate: ['photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl'],
  light: ['photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl'],
  full: ['taxonSpeciesId', 'photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl']
}
