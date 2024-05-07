import { type BestDetection } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type WithTotalCount } from '@rfcx-bio/common/total-count'

import { getBestDetections as coreGetBestDetections } from '~/api-core/api-core'
import { type CoreBestDetectionQueryParams } from '~/api-core/types'

interface BestDetectionParamsParsed {
  start?: string
  end?: string
  reviewStatus?: ArbimonReviewStatus[]
  sites?: string[]
  nPerStream?: number
  byDate?: boolean
  limit?: number
  offset?: number
}

export const getBestDetections = async (token: string, jobId: number, params: BestDetectionParamsParsed): Promise<WithTotalCount<BestDetection[]>> => {
  const coreParams: CoreBestDetectionQueryParams = {
    start: params?.start,
    end: params?.end,
    // @ts-expect-error these are off-spec array parsing
    streams: params?.['sites[]'] !== undefined ? Array.isArray(params?.['sites[]']) ? params['sites[]'] : [params['sites[]']] : undefined,
    by_date: params.byDate,
    // @ts-expect-error these are off-spec array parsing
    review_statuses: params?.['reviewStatus[]'] !== undefined ? Array.isArray(params?.['reviewStatus[]']) ? params['reviewStatus[]'] : [params['reviewStatus[]']] : undefined,
    n_per_stream: params?.nPerStream !== undefined && !Number.isNaN(Number(params.nPerStream)) ? Number(params.nPerStream) : undefined,
    limit: params?.limit,
    offset: params?.offset
  }

  const response = await coreGetBestDetections(token, jobId, coreParams)
  return {
    total: response.total,
    data: response.data.map(d => {
      return {
        siteIdCore: d.stream_id,
        start: d.start,
        end: d.end,
        confidence: d.confidence,
        classification: d.classification,
        dailyRanking: d.bestDetection.daily_ranking,
        streamRanking: d.bestDetection.stream_ranking
      }
    })
  }
}
