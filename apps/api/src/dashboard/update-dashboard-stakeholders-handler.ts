import { type UpdateDashboardStakeholdersParams, type UpdateDashboardStakeholdersRequestBody } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { updateProjectStakeholders } from './dashboard-stakeholders-dao'

export const updateDashboardStakeholdersHandler: Handler<string, UpdateDashboardStakeholdersParams, unknown, UpdateDashboardStakeholdersRequestBody> = async (req, rep) => {
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

  await updateProjectStakeholders(projectIdInteger, req.body)
  void rep.code(204)
  return ''
}
