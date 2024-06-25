import dayjs from 'dayjs'

import { type BestDetection } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type WithTotalCount } from '@rfcx-bio/common/total-count'

import { getBestDetections as coreGetBestDetections } from '~/api-core/api-core'
import { type CoreBestDetectionQueryParams } from '~/api-core/types'
import { BioInvalidQueryParamError } from '~/errors'
import { convertReviewStatusQueryParameter, getArbimonReviewStatus } from './get-detections-bll'

interface BestDetectionParamsParsed {
  start?: string
  end?: string
  classifications?: string[]
  reviewStatus?: ArbimonReviewStatus[]
  sites?: string[]
  nPerChunk?: number
  byDate?: boolean
  limit?: number
  offset?: number
}

export const getBestDetections = async (token: string, jobId: number, params: BestDetectionParamsParsed): Promise<WithTotalCount<BestDetection[]>> => {
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

  const coreParams: CoreBestDetectionQueryParams = {
    start: params?.start,
    end: params?.end,
    // @ts-expect-error these are off-spec array parsing
    streams: params?.['sites[]'] !== undefined ? Array.isArray(params?.['sites[]']) ? params['sites[]'] : [params['sites[]']] : undefined,
    // @ts-expect-error these are off-spec array parsing
    classification_ids: params?.['classifications[]'] !== undefined ? Array.isArray(params?.['classifications[]']) ? params['classifications[]'].map(c => Number(c)) : [Number(params['classifications[]'])] : undefined,
    // @ts-expect-error type checks are important because there's no type conversions
    by_date: params?.byDate !== undefined ? params.byDate === 'true' : undefined,
    // @ts-expect-error these are off-spec array parsing
    review_statuses: convertReviewStatusQueryParameter(params?.['reviewStatus[]']),
    n_per_chunk: params?.nPerChunk !== undefined && !Number.isNaN(Number(params.nPerChunk)) ? Number(params.nPerChunk) : undefined,
    limit: params?.limit,
    offset: params?.offset,
    fields: [
      'id',
      'stream_id',
      'classifier_id',
      'start',
      'end',
      'confidence',
      'review_status'
    ]
  }

  const response = await coreGetBestDetections(token, jobId, coreParams)
  return {
    total: response.total,
    data: response.data.map(d => {
      return {
        id: Number(d.id),
        siteIdCore: d.stream_id,
        classifierId: d.classifier_id,
        start: d.start,
        end: d.end,
        confidence: d.confidence,
        reviewStatus: getArbimonReviewStatus(d.review_status),
        classification: d.classification,
        streamRanking: d.bestDetection?.stream_ranking,
        streamDailyRanking: d.bestDetection?.stream_daily_ranking,
        streamClassificationRanking: d.bestDetection?.stream_classification_ranking,
        streamClassificationDailyRanking: d.bestDetection?.stream_classification_daily_ranking
      }
    })
  }
}
