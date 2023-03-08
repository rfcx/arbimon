import { type DetectSummaryParams, type DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getDetectionSummary } from './detect-bll'

export const detectSummaryHandler: Handler<DetectSummaryResponse, DetectSummaryParams> = async (req) => {
  // Inputs & validation
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  return await getDetectionSummary()
}
