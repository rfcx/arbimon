import { type GetDetectionsSummaryQueryParams, type GetDetectionsSummaryResponse } from '@rfcx-bio/common/api-bio/cnn/detections-summary'

import { type Handler } from '~/api-helpers/types'
import { getDetectionsSummary } from './get-detections-summary-bll'

export const getDetectionsSummaryHandler: Handler<GetDetectionsSummaryResponse, unknown, GetDetectionsSummaryQueryParams> = async (req) => {
  const summary = await getDetectionsSummary(req.headers.authorization ?? '', req.query)
  return summary
}
