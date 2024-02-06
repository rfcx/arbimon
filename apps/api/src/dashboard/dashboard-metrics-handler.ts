import { type DashboardMetricsParams, type DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectMetrics } from './dashboard-metrics-dao'

export const dashboardMetricsHandler: Handler<DashboardMetricsResponse, DashboardMetricsParams> = async (req, rep) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  return await getProjectMetrics(projectIdInteger)
}
