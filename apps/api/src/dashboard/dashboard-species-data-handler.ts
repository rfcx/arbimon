import { type DashboardSpeciesDataParams, type DashboardSpeciesDataResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getHighlightedSpecies, getRichnessByRisk, getRichnessByTaxon, getTotalSpecies } from './dashboard-species-data-dao'

export const dashboardSpeciesDataHandler: Handler<DashboardSpeciesDataResponse, DashboardSpeciesDataParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessByTaxon, richnessByRisk, totalSpecies, speciesHighlightedRaw] = await Promise.all([
    getRichnessByTaxon(projectIdInteger),
    getRichnessByRisk(projectIdInteger),
    getTotalSpecies(projectIdInteger),
    getHighlightedSpecies(projectIdInteger)
  ])

  return {
    richnessByRisk,
    richnessByTaxon,
    speciesHighlighted: speciesHighlightedRaw.map(({ taxonClassSlug, taxonSpeciesSlug, riskRatingId, ...rest }) => {
      return {
        ...rest,
        taxonSlug: taxonClassSlug,
        slug: taxonSpeciesSlug,
        riskId: riskRatingId
      }
    }),
    totalSpeciesCount: totalSpecies
  }
}
