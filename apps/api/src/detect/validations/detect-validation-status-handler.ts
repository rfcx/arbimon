import { type DetectValidationResultsParams, type DetectValidationResultsQueryParams, type DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getValidationResults } from './detect-bll'

export const detectValidationStatusHandler: Handler<DetectValidationResultsResponse, DetectValidationResultsParams, DetectValidationResultsQueryParams> = async (req) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  // Inputs & validation
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  return await getValidationResults(token, jobIdInteger, req.query)
}
