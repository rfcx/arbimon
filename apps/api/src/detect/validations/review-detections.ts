import { type RequestQuerystringDefault } from 'fastify'

import { type DetectReviewDetectionBody, type DetectReviewDetectionParams, type DetectReviewDetectionResponse } from '@rfcx-bio/common/api-bio/detect/review-detections'

import { updateDetectionReviewFromApi } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'

export const detectReviewDetectionHandler: Handler<DetectReviewDetectionResponse, DetectReviewDetectionParams, RequestQuerystringDefault, DetectReviewDetectionBody> = async (req): Promise<DetectReviewDetectionResponse> => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  return await updateDetectionReviewFromApi(token, req.body)
}
