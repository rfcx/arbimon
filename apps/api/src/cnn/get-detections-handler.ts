import { type GetDetectionsQueryParams, type GetDetectionsResponse, xTotalDetectionsCountHeaderName } from '@rfcx-bio/common/api-bio/cnn/detections'

import { type Handler } from '~/api-helpers/types'
import { getDetections } from './get-detections-bll'

export const getDetectionsHandler: Handler<GetDetectionsResponse, unknown, GetDetectionsQueryParams> = async (req, rep) => {
  const detections = await getDetections(req.headers.authorization ?? '', req.query)
  void rep.header(xTotalDetectionsCountHeaderName, detections.total)

  return detections.data
}
