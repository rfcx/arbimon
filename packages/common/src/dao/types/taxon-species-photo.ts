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

export const ATTRIBUTES_TAXON_SPECIES_PHOTO = attributes<TaxonSpeciesPhoto>()({
  light: ['photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl'],
  full: ['taxonSpeciesId', 'photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl']
})
