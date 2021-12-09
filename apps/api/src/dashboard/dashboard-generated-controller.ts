import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio-types/dashboard-generated.js'

import { Controller } from '../_services/api-helper/types.js'
import { assertParamsExist } from '../_services/validation/index.js'
import { getGeneratedData } from './dao.js'

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
