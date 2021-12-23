import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { Controller } from '../_services/api-helper/types'
import { assertParamsExist } from '../_services/validation'
import { getProfile } from './dao'

export const dashboardProfileController: Controller<DashboardProfileParams, DashboardProfileResponse> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const profile = await getProfile()

  // Response
  const response: DashboardProfileResponse = {
    ...profile
  }

  return response
}
