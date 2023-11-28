import { type UpdateInsightsPublishStatusRequestBody, type UpdateInsightsPublishStatusRequestParams } from '@rfcx-bio/common/api-bio/insights-publish-status/insights-publish-status'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioPublicError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { updateInsightsPublishStatus } from './insights-publish-status-dao'

export const patchInsightsPublishStatusHandler: Handler<any, UpdateInsightsPublishStatusRequestParams, unknown, UpdateInsightsPublishStatusRequestBody> = async (req, rep) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  // Inputs and validations
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const { status } = req.body
  if (status == null) {
    throw new BioPublicError('Invalid required body parameter `status`', 400)
  }

  await updateInsightsPublishStatus(projectIdInteger, status)
  void rep.code(204)
}
