import { type UpdateProjectPublishStatusRequestBody, type UpdateProjectPublishStatusRequestParams } from '@rfcx-bio/common/api-bio/project/project-publish-status'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioPublicError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { updateProjectPublishStatus } from './dao/project-status-dao'

export const patchProjectPublishStatusHandler: Handler<any, UpdateProjectPublishStatusRequestParams, unknown, UpdateProjectPublishStatusRequestBody> = async (req, rep) => {
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

  await updateProjectPublishStatus(projectIdInteger, status)
  void rep.code(204)
}
