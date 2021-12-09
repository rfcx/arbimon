import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio-types/dashboard-profile.js'

import { Controller } from '../_services/api-helper/types.js'
import { assertParamsExist } from '../_services/validation/index.js'
import { getProfile } from './dao.js'

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
