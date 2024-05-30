import { type DashboardContentParams, type DashboardContentResponse, type UpdateDashboardContentParams, type UpdateDashboardContentRequestBody, type UpdateDashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'
import { locationProjectProfileContentType } from '@rfcx-bio/node-common/dao/types'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioPublicError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getDashboardContent, updateDashboardContent } from './dashboard-content-dao'

/**
 * @deprecated please use GET `/projects/:projectId/profile?fields=readme,keyResult,resources,methods` instead
 */
export const dashboardContentHandler: Handler<DashboardContentResponse, DashboardContentParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectContent = await getDashboardContent(projectIdInteger)
  return projectContent
}

/**
 * @deprecated please use PATCH `/projects/:projectId/profile` instead
 */
export const updateDashboardContentHandler: Handler<UpdateDashboardContentResponse, UpdateDashboardContentParams, unknown, UpdateDashboardContentRequestBody> = async (req) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  // Inputs & validation
  const { projectId } = req.params

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const { contentType, value } = req.body

  // @ts-expect-error the contentType === '' is correct type-wise but we still need to check for it.
  if (contentType == null || contentType === '' || !locationProjectProfileContentType.includes(contentType)) {
    throw new BioPublicError('Missing or invalid required body parameter `contentType`', 400)
  }

  if (value == null) {
    throw new BioPublicError('Missing or invalid required body parameter `value`', 400)
  }

  await updateDashboardContent(token, projectIdInteger, contentType, value)

  return {
    message: 'OK'
  }
}
