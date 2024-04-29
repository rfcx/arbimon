import dayjs from 'dayjs'

import { type ArbimonReviewStatus, type ValidationStatus, ARBIMON_CORE_REVIEW_STATUS_MAP } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { getDetectionsSummary as coreGetDetectionsSummary } from '~/api-core/api-core'
import { type CoreGetDetectionsSummaryQueryParams } from '~/api-core/types'
import { BioInvalidQueryParamError, BioMissingQueryParamError, BioPublicError } from '~/errors'
import { convertReviewStatusQueryParameter } from './get-detections-bll'

interface DetectionsSummaryOptions {
  start: string
  end: string
  sites?: string[]
  classifierJobId: number
  classification?: string
  confidence?: number
  classifierId: number
  reviewStatus?: ArbimonReviewStatus[]
}

export const getDetectionsSummary = async (token: string, params: DetectionsSummaryOptions): Promise<Omit<ValidationStatus, 'total'>> => {
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

  const coreQueryParams: CoreGetDetectionsSummaryQueryParams = {
    start: params.start,
    end: params.end,
    // @ts-expect-error these brackets are needed because axios is off-spec, solvable when upgrading to `axios^1.0`
    streams: params?.['sites[]'] !== undefined ? Array.isArray(params?.['sites[]']) ? params['sites[]'] : [params['sites[]']] : undefined,
    classifications: params.classification == null || params.classification === '' ? undefined : [params.classification],
    classifiers: [Number(params.classifierId)],
    classifier_jobs: [Number(params.classifierJobId)],
    min_confidence: params.confidence === undefined ? undefined : Number(params.confidence),
    // @ts-expect-error these brackets are needed because axios is off-spec, solvable when upgrading to `axios^1.0`
    review_statuses: convertReviewStatusQueryParameter(params?.['reviewStatus[]'])
  }

  const coreDetectionsSummary = await coreGetDetectionsSummary(token, coreQueryParams)

  return {
    unvalidated: coreDetectionsSummary[ARBIMON_CORE_REVIEW_STATUS_MAP.unvalidated],
    notPresent: coreDetectionsSummary[ARBIMON_CORE_REVIEW_STATUS_MAP.notPresent],
    unknown: coreDetectionsSummary[ARBIMON_CORE_REVIEW_STATUS_MAP.unknown],
    present: coreDetectionsSummary[ARBIMON_CORE_REVIEW_STATUS_MAP.present]
  }
}
