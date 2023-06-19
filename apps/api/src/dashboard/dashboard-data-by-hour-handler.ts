import { type DashboardDataByHourParams, type DashboardDataByHourResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-hour'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getDetectionByHour, getRichnessByHour } from './dashboard-generated-dao'

export const dashboardDataByHourHandler: Handler<DashboardDataByHourResponse, DashboardDataByHourParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessByHour, detectionByHour] = await Promise.all([
    getRichnessByHour(projectIdInteger),
    getDetectionByHour(projectIdInteger)
  ])

  return {
    richnessByHour,
    detectionByHour
  }
}
