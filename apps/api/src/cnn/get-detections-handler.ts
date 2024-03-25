import { type GetDetectionsQueryParams, type GetDetectionsResponse } from '@rfcx-bio/common/api-bio/cnn/detections'

import { type Handler } from '~/api-helpers/types'
import { getDetections } from './get-detections-bll'

export const getDetectionsHandler: Handler<GetDetectionsResponse, unknown, GetDetectionsQueryParams> = async (req) => {
  const detections = await getDetections(req.headers.authorization ?? '', req.query)
  return detections
}
