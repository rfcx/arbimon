import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { Controller } from '../_services/api-helper/types'
import { assertParamsExist } from '../_services/validation'
import { getGeneratedData, getProfile } from './dao-dashboard-generated'

export const dashboardGeneratedController: Controller<DashboardGeneratedParams, DashboardGeneratedResponse> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const response: DashboardGeneratedResponse = await getGeneratedData()

  // Response
  return response
}

export const dashboardProfileController: Controller<DashboardProfileParams, DashboardProfileResponse> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const response: DashboardProfileResponse = await getProfile()

  // Response
  return response
}
