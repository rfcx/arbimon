import { type DashboardSpeciesDataParams, type DashboardSpeciesDataResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getHighlightedSpecies, getRichnessByRisk, getRichnessByTaxon, getSpeciesThreatened } from './dashboard-species-data-dao'

export const dashboardSpeciesDataHandler: Handler<DashboardSpeciesDataResponse, DashboardSpeciesDataParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessByTaxon, richnessByRisk, speciesThreatened, speciesHighlightedRaw] = await Promise.all([
    getRichnessByTaxon(projectIdInteger),
    getRichnessByRisk(projectIdInteger),
    getSpeciesThreatened(projectIdInteger),
    getHighlightedSpecies(projectIdInteger)
  ])

  return {
     speciesHighlighted: speciesHighlightedRaw.map(({ taxonClassSlug, taxonSpeciesSlug, riskRatingId, ...rest }) => {
      return {
        ...rest,
        taxonSlug: taxonClassSlug,
        slug: taxonSpeciesSlug,
        riskId: riskRatingId
      }
    }),
    speciesThreatened,
    richnessByRisk,
    richnessByTaxon
  }
}
