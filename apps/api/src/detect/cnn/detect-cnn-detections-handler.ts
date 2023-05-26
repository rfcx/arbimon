import { type RequestParamsDefault } from 'fastify'

import { type DetectCnnDetectionsQueryParams, type DetectCnnDetectionsResponse } from '@rfcx-bio/common/api-bio/detect/detect-cnn-detections'

import { getDetections } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioUnauthorizedError } from '~/errors'

export const detectCnnDetectionsHandler: Handler<DetectCnnDetectionsResponse[], RequestParamsDefault, DetectCnnDetectionsQueryParams> = async (req): Promise<DetectCnnDetectionsResponse[]> => {
  const token = req.headers.authorization

  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  const detections = await getDetections(token, req.query)
  return detections
}
