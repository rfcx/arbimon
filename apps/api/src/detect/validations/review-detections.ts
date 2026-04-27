import { type RequestQuerystringDefault } from 'fastify'

import { type DetectReviewDetectionBody, type DetectReviewDetectionParams, type DetectReviewDetectionResponse } from '@rfcx-bio/common/api-bio/detect/review-detections'

import { getProjectByCoreId } from '@/projects/dao/projects-dao'
import { assertProjectAnalysisAllowed } from '@/projects/project-entitlement-bll'
import { getClassifierJobInformation, updateDetectionReviewFromApi } from '~/api-core/api-core'
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

  const classifierJob = await getClassifierJobInformation(token, jobIdInteger)
  const project = await getProjectByCoreId(classifierJob.projectId)
  if (project !== undefined) {
    await assertProjectAnalysisAllowed(project.id)
  }

  return await updateDetectionReviewFromApi(token, jobIdInteger, req.body)
}
