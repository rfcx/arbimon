import { type GetInsightsPublishStatusRequestParams, type GetInsightsPublishStatusResponseBody } from '@rfcx-bio/common/api-bio/insights-publish-status/insights-publish-status'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getInsightsPublisStatus } from './insights-publish-status-dao'

export const getInsightsPublishStatusHandler: Handler<GetInsightsPublishStatusResponseBody, GetInsightsPublishStatusRequestParams> = async (req) => {
  // Inputs and validations
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const status = await getInsightsPublisStatus(projectIdInteger)
  return status
}
