import { type DashboardSpeciesDataParams } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'
import { type DashboardSpeciesRishnessByRiskDataResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-richness-by-risk'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getRichnessByRisk, getTotalSpecies } from './dashboard-species-richness-by-risk-data-dao'

export const dashboardSpeciesRichnessByRiskDataHandler: Handler<DashboardSpeciesRishnessByRiskDataResponse, DashboardSpeciesDataParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessByRisk, totalSpecies] = await Promise.all([
    getRichnessByRisk(projectIdInteger),
    getTotalSpecies(projectIdInteger)
  ])

  return { richnessByRisk, totalSpeciesCount: totalSpecies }
}
