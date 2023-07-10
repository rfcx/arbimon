import { type DetectDetectionsParams, type DetectDetectionsQueryParams, type DetectDetectionsResponse } from '@rfcx-bio/common/api-bio/detect/detect-detections'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getDetections } from './detect-bll'

export const detectDetectionsHandler: Handler<DetectDetectionsResponse, DetectDetectionsParams, DetectDetectionsQueryParams> = async (req) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  return await getDetections(token, jobIdInteger, req.query)
}
