import { type DetectDetectionsQueryParams, type DetectDetectionsResponse, type REVIEW_STATUS_MAPPING, type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { type DetectSummaryQueryParams, type DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { type DetectValidation, type DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { type DetectValidationStatusResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-status'

import { getDetectionsFromApi, getDetectionsStatusFromApi } from '~/api-core/api-core'
import { type DetectDetectionsQueryParamsCore } from '~/api-core/types'
import { getInMemoryDetectValidationStatus, updateInMemoryDetectValidation } from './detect-dao'
import { mockDetections } from './mock-detections'

const mockData = mockDetections

const getReviewStatus = (input: typeof REVIEW_STATUS_MAPPING[ReviewStatus]): ReviewStatus => {
  if (input === 1) {
    return 'confirmed'
  }

  if (input === 0) {
    return 'uncertain'
  }

  if (input === -1) {
    return 'rejected'
  }

  if (input === null) {
    return 'unreviewed'
  }

  throw new Error('Error: unknown review status')
}

export const getDetections = async (token: string, jobId: number, query: DetectDetectionsQueryParams): Promise<DetectDetectionsResponse> => {
  const detectionsParams: DetectDetectionsQueryParamsCore = {
    start: query.start,
    end: query.end,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    streams: query['sites[]'],
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    classifications: query['classifications[]'],
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    classifiers: query['classifiers[]'],
    classifier_jobs: [jobId],
    min_confidence: query.minConfidence,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    review_statuses: query['reviewStatuses[]'],
    limit: query.limit,
    offset: query.offset,
    descending: query.descending,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    fields: query['fields[]']
  }

  const detections = await getDetectionsFromApi(token, detectionsParams)

  return detections.map(detection => {
    return {
      id: detection.id,
      siteId: detection.stream_id,
      classifierId: detection.classifier_id,
      start: detection.start,
      end: detection.end,
      confidence: detection.confidence,
      reviewStatus: getReviewStatus(detection.review_status),
      classification: {
        value: detection.classification.value,
        title: detection.classification.title,
        image: detection.classification.image
      }
    }
  })
}

export const getDetectionSummary = async (token: string, jobId: number, query: DetectSummaryQueryParams): Promise<DetectSummaryResponse> => {
  const detectSummaryQuery: DetectSummaryQueryParams = {
    // @ts-expect-error axios sends array query params with [], which is off-spec. Fastify parses it using the spec, This way of access is required.
    fields: query['fields[]']
  }

  const response = await getDetectionsStatusFromApi(token, jobId, detectSummaryQuery)
  return response
}

export const getValidationStatus = async (): Promise<DetectValidationStatusResponse> => {
  return await getInMemoryDetectValidationStatus(mockData)
}

export const validateDetections = async (validationList: DetectValidation[]): Promise<DetectValidationResponse> => {
  return await updateInMemoryDetectValidation(mockData, validationList)
}
