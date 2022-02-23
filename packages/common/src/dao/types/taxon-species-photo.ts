export interface TaxonSpeciesPhoto {
  taxonSpeciesId: number
  source: string
  photoUrl: string
  photoCaption: string
  photoAuthor: string
  photoLicense: string
  photoLicenseUrl?: string
}

export type SpeciesPhotoLight = Pick<TaxonSpeciesPhoto,
  'photoUrl' |
  'photoCaption' |
  'photoAuthor' |
  'photoLicense' |
  'photoLicenseUrl'
>
