import { Source } from '@/dao/types/source'

export interface TaxonSpeciesPhoto {
  taxonSpeciesId: number
  source: Source
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
