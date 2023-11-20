import { type UpdateDashboardStakeholderOrganizationsParams, type UpdateDashboardStakeholderOrganizationsRequestBody, type UpdateDashboardStakeholderOrganizationsResponseBody } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { updateProjectStakeholdersOrganization } from './dashboard-stakeholders-dao'

export const updateDashboardStakeholderOrganizationsHandler: Handler<UpdateDashboardStakeholderOrganizationsResponseBody, UpdateDashboardStakeholderOrganizationsParams, unknown, UpdateDashboardStakeholderOrganizationsRequestBody> = async (req) => {
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

  if (req.body.organizations.length === 0) {
    return {
      message: 'OK'
    }
  }

  await updateProjectStakeholdersOrganization(projectIdInteger, req.body.organizations)

  return {
    message: 'OK'
  }
}
