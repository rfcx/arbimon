import { type DashboardSpeciesByRiskDataResponse, type DashboardSpeciesByRiskParams, type DashboardSpeciesByRiskQuery } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-by-risk'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getSpeciesByRisk } from './dashboard-species-by-risk-dao'

export const dashboardSpeciesByRiskDataHandler: Handler<DashboardSpeciesByRiskDataResponse, DashboardSpeciesByRiskParams, DashboardSpeciesByRiskQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const { riskRatingId } = req.query

  const riskRatingIdInteger = Number(riskRatingId)
  if (Number.isNaN(riskRatingIdInteger)) {
    throw BioInvalidPathParamError({ riskRatingIdInteger })
  }

  const species = await getSpeciesByRisk(projectIdInteger, riskRatingIdInteger)

  return { riskRatingId: riskRatingIdInteger, species }
}
