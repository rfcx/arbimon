import dayjs from 'dayjs'

import { type ArbimonReviewStatus, type CoreRawReviewStatus, ARBIMON_CORE_REVIEW_STATUS_MAP } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type Detection, type GetDetectionsQueryParams } from '@rfcx-bio/common/api-bio/cnn/detections'

import { parseLimitOffset } from '@/search/helpers'
import { getDetections as coreGetDetections } from '~/api-core/api-core'
import { type CoreGetDetectionsQueryParams } from '~/api-core/types'
import { BioInvalidQueryParamError, BioMissingQueryParamError, BioPublicError } from '~/errors'

const getArbimonReviewStatus = (reviewStatus: CoreRawReviewStatus): ArbimonReviewStatus => {
  if (reviewStatus === null) {
    return 'unvalidated'
  }

  if (reviewStatus === -1) {
    return 'notPresent'
  }

  if (reviewStatus === 0) {
    return 'unknown'
  }

  if (reviewStatus === 1) {
    return 'present'
  }

  return 'unvalidated'
}

export const getDetections = async (token: string, params: GetDetectionsQueryParams): Promise<Detection[]> => {
  if (params?.start === undefined || params?.start === '' || !dayjs(params?.start).isValid()) {
    throw BioInvalidQueryParamError({ start: params?.start })
  }

  if (params?.end === undefined || params?.end === '' || !dayjs(params?.end).isValid()) {
    throw BioInvalidQueryParamError({ end: params?.end })
  }

  if (dayjs(params.end).isBefore(dayjs(params.start))) {
    throw new BioPublicError('Property `end` cannot be before `start`', 400)
  }

  if (params.classifierId === undefined || params.classifierId === null) {
    throw BioMissingQueryParamError('classifierId')
  }

  if (params.classifierJobId === undefined || params.classifierJobId === null) {
    throw BioMissingQueryParamError('classifierJobId')
  }

  const { limit, offset } = parseLimitOffset(params.limit, params.offset, { defaultLimit: 100 })
  const coreQueryParams: CoreGetDetectionsQueryParams = {
    start: params.start,
    end: params.end,
    // @ts-expect-error these brackets are needed because axios is off-spec, solvable when upgrading to `axios^1.0`
    streams: params?.['sites[]'] !== undefined ? Array.isArray(params?.['sites[]']) ? params['sites[]'] : [params['sites[]']] : undefined,
    classifications: params.classification == null || params.classification === '' ? undefined : [params.classification],
    classifiers: [Number(params.classifierId)],
    classifier_jobs: [Number(params.classifierJobId)],
    min_confidence: params.confidence === undefined ? undefined : Number(params.confidence),
    review_statuses: params.reviewStatus === undefined ? undefined : [ARBIMON_CORE_REVIEW_STATUS_MAP[params.reviewStatus]],
    limit,
    offset,
    descending: true,
    fields: [
      'id',
      'stream_id',
      'classifier_id',
      'start',
      'end',
      'confidence',
      'review_status',
      'classification'
    ]
  }

  const coreDetections = await coreGetDetections(token, coreQueryParams)
  return coreDetections.map(detection => {
    return {
      id: Number(detection.id),
      siteIdCore: detection.stream_id,
      start: detection.start,
      end: detection.end,
      classifierId: detection.classifier_id,
      confidence: detection.confidence,
      reviewStatus: getArbimonReviewStatus(detection.review_status),
      classification: detection.classification
    }
  })
}
