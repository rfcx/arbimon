import { type GetBestDetectionsParams } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type GetBestDetectionsSummaryQueryParams, type GetBestDetectionsSummaryResponse } from '@rfcx-bio/common/api-bio/cnn/best-detections-summary'

import { type Handler } from '~/api-helpers/types'
import { getBestDetectionsSummary } from './get-best-detections-summary-bll'

export const getBestDetectionsSummaryHandler: Handler<GetBestDetectionsSummaryResponse, GetBestDetectionsParams, GetBestDetectionsSummaryQueryParams> = async (req) => {
  const response = await getBestDetectionsSummary(req.headers.authorization ?? '', Number(req.params.jobId), req.query)
  return response
}
