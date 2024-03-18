import { type DashboardStakeholdersParams, type DashboardStakeholdersResponse, type UpdateDashboardStakeholdersParams, type UpdateDashboardStakeholdersRequestBody } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectStakeholders, getProjectUsers, updateProjectStakeholders } from './dashboard-stakeholders-dao'

export const dashboardStakeholdersHandler: Handler<DashboardStakeholdersResponse, DashboardStakeholdersParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const organizations = await getProjectStakeholders(projectIdInteger)

  const { projectRole } = req
  const includeAllMembers = projectRole === 'admin' || projectRole === 'owner'
  const users = await getProjectUsers(projectIdInteger, !includeAllMembers)

  return {
    users,
    organizations
  }
}

export const updateDashboardStakeholdersHandler: Handler<string, UpdateDashboardStakeholdersParams, unknown, UpdateDashboardStakeholdersRequestBody> = async (req, rep) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  await updateProjectStakeholders(projectIdInteger, req.body)

  void rep.code(204)
  return ''
}
