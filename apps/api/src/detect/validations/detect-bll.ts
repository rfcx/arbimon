import { type DetectDetectionsQueryParams, type DetectDetectionsResponse, type REVIEW_STATUS_MAPPING, type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { type DetectSummaryQueryParams, type DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { type DetectValidation, type DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { type DetectValidationResultsQueryParams, type DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'

import { getClassifierJobResultsFromApi, getDetectionsFromApi, getDetectionsStatusFromApi } from '~/api-core/api-core'
import { type DetectDetectionsQueryParamsCore } from '~/api-core/types'
import { updateInMemoryDetectValidation } from './detect-dao'
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

/**
 * @deprecated we are moving to using the route `GET /detections` instead. This will be removed once it's finished
 */
export const getDetections = async (token: string, jobId: number, query: DetectDetectionsQueryParams): Promise<DetectDetectionsResponse> => {
  const detectionsParams: DetectDetectionsQueryParamsCore = {
    start: query.start,
    end: query.end,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    streams: query['sites[]'] != null ? Array.isArray(query['sites[]']) ? query['sites[]'] : [query['sites[]']] : undefined,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    classifications: query['classifications[]'] != null ? Array.isArray(query['classifications[]']) ? query['classifications[]'] : [query['classifications[]']] : undefined,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    classifiers: query['classifiers[]'] != null ? Array.isArray(query['classifiers[]']) ? query['classifiers[]'] : [query['classifiers[]']] : undefined,
    // the request only send one classifier job id in
    classifier_jobs: [jobId],
    min_confidence: query.minConfidence,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    review_statuses: query['reviewStatuses[]'] != null ? Array.isArray(query['reviewStatuses[]']) ? query['reviewStatuses[]'] : [query['reviewStatuses[]']] : undefined,
    limit: query.limit,
    offset: query.offset,
    descending: query.descending,
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    fields: query['fields[]'] != null ? Array.isArray(query['fields[]']) ? query['fields[]'] : [query['fields[]']] : undefined
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
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    fields: query['fields[]'] != null ? Array.isArray(query['fields[]']) ? query['fields[]'] : [query['fields[]']] : undefined
  }

  const response = await getDetectionsStatusFromApi(token, jobId, detectSummaryQuery)
  return response
}

export const getValidationResults = async (token: string, jobId: number, query: DetectValidationResultsQueryParams): Promise<DetectValidationResultsResponse> => {
  const detectionsResultsQuery: DetectValidationResultsQueryParams = {
    // @ts-expect-error query params with angled brackets is not on spec. Fastify parses it using the spec. So this way of accessing the query is needed.
    fields: query['fields[]'] != null ? Array.isArray(query['fields[]']) ? query['fields[]'] : [query['fields[]']] : undefined
  }

  const results = await getClassifierJobResultsFromApi(token, jobId, detectionsResultsQuery)
  return results
}

export const validateDetections = async (validationList: DetectValidation[]): Promise<DetectValidationResponse> => {
  return await updateInMemoryDetectValidation(mockData, validationList)
}
