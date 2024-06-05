import { type CoreRawReviewStatus, type CoreReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type CLASSIFIER_JOB_LABELS } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'
import { type REVIEW_STATUS_MAPPING, type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'

/**
 * @deprecated please use the alternative `CoreGetDetectionsQueryParams` interface instead
 */
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
/**
 * @deprecated please use the alternative `CoreDetection` interface instead
 */
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
  unreviewed: number
  rejected: number
  uncertain: number
  confirmed: number
}

export interface GetClassifierJobClassificationSummaryQueryParams {
  keyword?: string
  limit?: number
  offset?: number
  sort?: string
}

export interface CoreClassificationLite {
  title: string
  value: string
  image: string | null
}

export interface CoreClassifierJobClassificationSummary {
  classificationsSummary: Array<CoreClassifierJobSummary & CoreClassificationLite>
}

export interface CoreClassifierJobTotalDetections {
  reviewStatus: CoreClassifierJobSummary
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

export interface CoreGetDetectionsQueryParams {
  start: string
  end: string
  streams?: string[]
  projects?: string[]
  classifications?: string[]
  classifiers?: number[]
  classifier_jobs?: number[]
  min_confidence?: number
  review_statuses?: CoreReviewStatus[]
  limit?: number
  offset?: number
  descending?: boolean
  fields?: string[]
}

export type CoreGetBestDetectionsSummaryQueryParams = Omit<CoreBestDetectionQueryParams, 'limit' | 'offset' | 'fields'>

export type CoreGetDetectionsSummaryQueryParams = Omit<CoreGetDetectionsQueryParams, 'limit' | 'offset' | 'descending' | 'fields'>

export type CoreDetectionsSummary = Omit<CoreClassifierJobSummary, 'total'>

export interface CoreDetection {
  id: string
  stream_id: string
  classifier_id: number
  start: string
  end: string
  confidence: number
  review_status: CoreRawReviewStatus
  classification: CoreClassificationLite
}

export interface CoreBestDetectionQueryParams {
  start?: string
  end?: string
  streams?: string[]
  by_date?: boolean
  review_statuses?: CoreReviewStatus
  n_per_stream?: number
  limit?: number
  offset?: number
  fields?: string[]
}

export type CoreBestDetection = CoreDetection & {
  bestDetection: {
    daily_ranking: number
    stream_ranking: number
  }
}

export interface CoreGetClassifiersQueryParams {
  limit?: number
  offset?: number
  sort?: string
  fields?: string[]
}

export interface CoreUpdateDetectionStatusBody {
  status: CoreReviewStatus
  classifier: number
  classification: string
  classifier_job: number
}

export interface CoreUpdateDetectionStatusParams {
  stream_id: string
  start: string
}

export type CoreUpdateDetectionsStatusResponse = Array<{ id: string, status: CoreReviewStatus }>

export interface CoreCreateClassifierJobBody {
  classifier_id: number
  project_id: string
  query_streams?: string
  query_start?: string
  query_end?: string
  query_hours?: string
}
