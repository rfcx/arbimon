import dayjs from 'dayjs'

import { type GetBestDetectionsQueryParams } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type ValidationStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { getBestDetectionsSummary as coreGetBestDetectionsSummary } from '~/api-core/api-core'
import { type CoreGetBestDetectionsSummaryQueryParams } from '~/api-core/types'
import { BioInvalidQueryParamError } from '~/errors'
import { convertReviewStatusQueryParameter } from './get-detections-bll'

export const getBestDetectionsSummary = async (token: string, jobId: number, params: Omit<GetBestDetectionsQueryParams, 'limit' | 'offset' | 'fields'>): Promise<Omit<ValidationStatus, 'total'>> => {
  if (params?.start !== undefined) {
    if (params?.start === '' || !dayjs(params?.start).isValid()) {
      throw BioInvalidQueryParamError({ start: params?.start })
    }
  }

  if (params?.end !== undefined) {
    if (params?.end === '' || !dayjs(params?.end).isValid()) {
      throw BioInvalidQueryParamError({ end: params?.end })
    }
  }

  const coreParams: CoreGetBestDetectionsSummaryQueryParams = {
    // @ts-expect-error these are off-spec array parsing
    streams: params?.['sites[]'] !== undefined ? Array.isArray(params?.['sites[]']) ? params['sites[]'] : [params['sites[]']] : undefined,
    start: params?.start,
    end: params?.end,
    // @ts-expect-error these are off-spec array parsing
    review_statuses: convertReviewStatusQueryParameter(params?.['reviewStatus[]']),
    n_per_chunk: params?.nPerChunk !== undefined && !Number.isNaN(Number(params.nPerChunk)) ? Number(params.nPerChunk) : undefined,
    // @ts-expect-error type checks are important because there's no type conversions
    by_date: params?.byDate !== undefined ? params.byDate === 'true' : undefined,
    classifications: params?.classifications
  }

  const response = await coreGetBestDetectionsSummary(token, jobId, coreParams)
  return {
    unvalidated: response.unreviewed,
    notPresent: response.rejected,
    unknown: response.uncertain,
    present: response.confirmed
  }
}
