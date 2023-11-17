import { type DashboardStakeholdersParams, type DashboardStakeholdersResponse, type UpdateDashboardStakeholderOrganizationsParams, type UpdateDashboardStakeholderOrganizationsRequestBody, type UpdateDashboardStakeholderOrganizationsResponseBody } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectStakeholders, updateProjectStakeholdersOrganization } from './dashboard-stakeholders-dao'

export const dashboardStakeholdersHandler: Handler<DashboardStakeholdersResponse, DashboardStakeholdersParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const organization = await getProjectStakeholders(projectIdInteger)

  return {
    // TODO: Implement user fetching over here.
    user: [],
    organization
  }
}

export const updateDashboardStakeholdersHandler: Handler<UpdateDashboardStakeholderOrganizationsResponseBody, UpdateDashboardStakeholderOrganizationsParams, unknown, UpdateDashboardStakeholderOrganizationsRequestBody> = async (req) => {
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

  await updateProjectStakeholdersOrganization(projectIdInteger, req.body.organizations)

  return {
    message: 'OK'
  }
}
