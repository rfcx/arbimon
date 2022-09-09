import { DetectValidation, DetectValidationParams, DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'

import { Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { validateDetections } from './detect-validation-bll'

export const detectValidationHandler: Handler<DetectValidationResponse, DetectValidationParams, unknown, DetectValidation[]> = async (req) => {
  // Inputs & validation
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  const detections = req.body

  return await validateDetections(detections)
}
