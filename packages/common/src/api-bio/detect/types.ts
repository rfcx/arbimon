export interface SpeciesDetection {
  jobId: number // add to core later
  siteId: string
  dateStart: string
  dateEnd: string
  classifierId: number
  classificationId: number
  confidence: number
  statusId: number | null
}

export interface ValidationStatus {
  id: number
  name: string
}
