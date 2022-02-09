export interface TaxonSpecies {
  id: number
  idArbimon: number
  slug: string
  taxonClassId: number
  scientificName: string
  commonName: string
  extinctionRiskRating: string
  extinctionRiskRatingSource: string
  description: string
  descriptionSource: string
  descriptionSourceUrl: string
  callProjectId: number
  callSiteId: number
  callType: string
  callRecordedAt: Date
  callTimezone: string
  callMediaWavUrl: string
  callMediaSpecUrl: string
  photoUrl: string
  photoCaption: string
  photoAuthor: string
  photoLicense: string
  photoLicenseUrl: string
}
