import { type GetBestDetectionsParams, type GetBestDetectionsQueryParams, type GetBestDetectionsResponse, xTotalBestDetectionsCountHeaderName } from '@rfcx-bio/common/api-bio/cnn/best-detections'

import { type Handler } from '~/api-helpers/types'
import { getBestDetections } from './get-best-detections-bll'

export const getBestDetectionsHandler: Handler<GetBestDetectionsResponse, GetBestDetectionsParams, GetBestDetectionsQueryParams> = async (req, rep) => {
  const bestDetections = await getBestDetections(req.headers?.authorization ?? '', Number(req.params.jobId), req.query)
  void rep.header('access-control-expose-headers', xTotalBestDetectionsCountHeaderName)
  void rep.header(xTotalBestDetectionsCountHeaderName, bestDetections.total)
  return bestDetections.data
}
