import { type DetectValidationStatusParams, type DetectValidationStatusResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-status'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getValidationStatus } from './detect-bll'

export const detectValidationStatusHandler: Handler<DetectValidationStatusResponse, DetectValidationStatusParams> = async (req) => {
  // Inputs & validation
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  return await getValidationStatus()
}
