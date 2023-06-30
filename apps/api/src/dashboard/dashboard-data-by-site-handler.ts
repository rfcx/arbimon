import { type DashboardDataBySiteParams, type DashboardDataBySiteResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-site'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getDetectionBySite, getRichnessBySite } from './dashboard-data-by-site-dao'

export const dashboardDataBySiteHandler: Handler<DashboardDataBySiteResponse, DashboardDataBySiteParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessBySite, detectionBySite] = await Promise.all([
    getRichnessBySite(projectIdInteger),
    getDetectionBySite(projectIdInteger)
  ])

  return {
    richnessBySite,
    detectionBySite
  }
}
