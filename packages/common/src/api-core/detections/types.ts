export interface SpeciesDetection {
  jobId: number // add to core later
  siteId: string
  dateStart: string
  dateEnd: string
  classifierId: number
  classificationId: number
  confidence: number
  statusId: number
}

export interface DetectionQueryParams {
  start: string | null
  end: string | null
  streams: string[] | null
  classifications?: string[]
  classifiers: string[] | null
  min_confidence?: number
  limit?: number
  offset?: number
}

export interface CoreDetectionResponse {
  stream_id: string
  start: string
  end: string
  classifier_id: number
  classification_id: number
  confidence: number
}
