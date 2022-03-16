import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { getDashboardProfile } from '@/dashboard/dashboard-profile-dao'
import { Handler } from '../_services/api-helpers/types'
import { BioInvalidPathParamError, BioNotFoundError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'

export const dashboardProfileHandler: Handler<DashboardProfileResponse, DashboardProfileParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  // Query & respond
  const dashboardProfile = await getDashboardProfile(projectIdInteger)
  if (!dashboardProfile) throw BioNotFoundError()
  return dashboardProfile
}
