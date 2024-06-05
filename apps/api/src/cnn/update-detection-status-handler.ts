import { type UpdateDetectionStatusBody, type UpdateDetectionStatusResponseBody } from '@rfcx-bio/common/api-bio/cnn/reviews'

import { type Handler } from '~/api-helpers/types'
import { updateDetectionStatus } from './update-detection-status-bll'

export const updateDetectionStatusHandler: Handler<UpdateDetectionStatusResponseBody, unknown, unknown, UpdateDetectionStatusBody> = async (req) => {
  const response = await updateDetectionStatus(req.headers?.authorization ?? '', req.body)
  return response
}
