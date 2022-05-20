export interface TaxonSpeciesMerged {
  id: number
  slug: string
  taxonClassId: number
  scientificName: string
  audioUrl: string
  audioSourceUrl: string
  spectrogramUrl: string
  commonName: string
  commonNameSourceId: number
  description: string
  descriptionSourceUrl: string
  descriptionSourceId: number
  photoUrl: string
  photoSourceUrl: string
  photoLicense: string
  photoCaption: string
  photoAuthor: string
  photoSourceId: number
  riskRatingId: number
  riskRatingCustomCode: string
  riskRatingSourceUrl: string
  riskRatingSourceId: number
}
