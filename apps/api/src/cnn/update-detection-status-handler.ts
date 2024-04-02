import { type UpdateDetectionStatusBody } from '@rfcx-bio/common/api-bio/cnn/reviews'

import { type Handler } from '~/api-helpers/types'
import { updateDetectionStatus } from './update-detection-status-bll'

export const updateDetectionStatusHandler: Handler<string, unknown, unknown, UpdateDetectionStatusBody> = async (req, rep) => {
  await updateDetectionStatus(req.headers?.authorization ?? '', req.body)
  void rep.code(204)
  return ''
}
