import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio-types/dashboard-generated'

import { Controller } from '../_services/api-helper/types'
import { assertParamsExist } from '../_services/validation'
import { getGeneratedData } from './dao'

export const dashboardGeneratedController: Controller<DashboardGeneratedParams, DashboardGeneratedResponse> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const data = await getGeneratedData()

  // Response
  const response: DashboardGeneratedResponse = {
    ...data
  }

  return response
}
