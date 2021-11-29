import { Controller } from '../_services/api-helper/types.js'
import { assertParamsExist } from '../_services/validation/index.js'
import { DashboardGeneratedParams, DashboardGeneratedResponse } from '../TEMP/api-bio-types/dashboard-generated.js'
import { getGeneratedData } from './dao.js'

export const dashboardGeneratedController: Controller<DashboardGeneratedParams, DashboardGeneratedResponse> = async (req) => {
  // Inputs
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
