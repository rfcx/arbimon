import { DetectSummaryParams, DetectSummaryQueryParams, DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'

import { Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { BaseQuery } from '~/query/base'
import { assertPathParamsExist } from '~/validation'
import { getDetectionSummary } from './detect-bll'

export const detectSummaryHandler: Handler<DetectSummaryResponse, DetectSummaryParams, DetectSummaryQueryParams> = async (req) => {
  // Inputs & validation
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  const limit = req.query.limit
  const offset = req.query.offset
  if (limit !== undefined && isNaN(parseInt(limit))) throw BioInvalidQueryParamError({ limit })
  if (offset !== undefined && isNaN(parseInt(offset))) throw BioInvalidQueryParamError({ offset })

  const query: BaseQuery = {
    limit: limit ? parseInt(limit) : 100,
    offset: offset ? parseInt(offset) : 0
  }

  return await getDetectionSummary(query)
}
