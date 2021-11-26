import { Controller } from '../_services/api-helper/types.js'
import { assertParamsExist } from '../_services/validation/index.js'
import { DashboardGeneratedParams, DashboardGeneratedResponse } from '../TEMP/api-bio-types/dashboard-generated.js'
import { getMetrics } from './dao.js'

export const dashboardGeneratedController: Controller<DashboardGeneratedParams, DashboardGeneratedResponse> = async (req) => {
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const metrics = await getMetrics()

  return {
    metrics
  }
}
