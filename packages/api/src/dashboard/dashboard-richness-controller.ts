import { DashboardRichnessParams, DashboardRichnessResponse } from 'TEMP/api-bio-types/dashboard-richness.js'

import { Controller } from '../_services/api-helper/types.js'
import { assertParamsExist } from '../_services/validation/index.js'
import { getRichness } from './dao.js'

export const dashboardRichnessController: Controller<DashboardRichnessParams, DashboardRichnessResponse[]> = async (req) => {
  // Inputs
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const richness = await getRichness()

  // Response
  const response: DashboardRichnessResponse[] = richness

  return response
}
