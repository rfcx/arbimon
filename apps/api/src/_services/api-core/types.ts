import { type REVIEW_STATUS_MAPPING, type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'

// Request type
export interface DetectDetectionsQueryParamsCore {
  start: string
  end: string
  // site concept for core
  streams?: string[]
  // what kind of species
  classifications?: string[]
  // models used
  classifiers?: number[]
  // which job to look for
  classifier_jobs: number[]
  // min confidence
  min_confidence?: number
  review_statuses?: ReviewStatus[]
  limit?: number
  offset?: number
  descending?: boolean
  fields?: string[]
}

// Response type
export type DetectDetectionsResponseCore = Array<{
  id: string
  stream_id: string
  classifier_id: number
  start: string
  end: string
  confidence: number
  review_status: typeof REVIEW_STATUS_MAPPING[ReviewStatus]
  classification: {
    value: string
    title: string
    image: string | null
  }
}>
