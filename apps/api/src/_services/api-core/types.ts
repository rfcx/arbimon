import { type CLASSIFIER_JOB_LABELS } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'
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

export interface CoreClassifierJobSummary {
  total: number
  rejected: number
  uncertain: number
  confirmed: number
}

export interface CoreClassifierJobClassificationSummary {
  reviewStatus: CoreClassifierJobSummary
  classificationsSummary: Array<CoreClassifierJobSummary & { title: string, value: string, image: string | null }>
}

export interface CoreClassifierJob {
  id: number
  classifierId: number
  projectId: string
  queryStreams: string | null
  queryStart: string
  queryEnd: string
  queryHours: string
  minutesTotal: number
  minutesCompleted: number
  status: keyof typeof CLASSIFIER_JOB_LABELS
  createdById: number
  createdAt: string
  completedAt: string | null
  classifier: {
    id: number
    name: string
    version: number
  }
}

export interface CoreClassifierJobInformation extends CoreClassifierJob {
  streams: Array<{ id: string, name: string }>
  totalDistinctClassifications: number
}
