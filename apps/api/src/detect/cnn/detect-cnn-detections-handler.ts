import { type RequestParamsDefault } from 'fastify'

import { type DetectCnnDetectionsQueryParams, type DetectCnnDetectionsResponse } from '@rfcx-bio/common/api-bio/detect/detect-cnn-detections'

import { type Handler } from '~/api-helpers/types'

export const detectCnnDetectionsHandler: Handler<DetectCnnDetectionsResponse, RequestParamsDefault, DetectCnnDetectionsQueryParams> = async (req): Promise<DetectCnnDetectionsResponse> => {
  console.info(req.params)

  return [
    {
      id: '12345',
      stream_id: 'lskdmfsfi',
      start: '2023-02-20T23:22:43.445Z',
      end: '2023-02-20T23:22:43.448Z',
      confidence: 0.123,
      review_status: null
    }
  ]
}
