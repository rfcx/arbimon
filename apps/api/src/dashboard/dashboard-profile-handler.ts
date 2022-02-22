import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { getHighlightedSpecies, getProjectProfile } from '@/dashboard/dashboard-profile-dao'
import { Handler } from '../_services/api-helpers/types'
import { BioInvalidPathParamError, BioNotFoundError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'

export const dashboardProfileHandler: Handler<DashboardProfileResponse, DashboardProfileParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  // Queries
  const [projectInformation, speciesHighlightedRaw] = await Promise.all([
    getProjectProfile(projectIdInteger),
    getHighlightedSpecies(projectIdInteger)
  ])

  if (!projectInformation) throw BioNotFoundError()
  const { summary, readme } = projectInformation

  // Response
  return {
    summary,
    readme,
    speciesHighlighted: speciesHighlightedRaw.map(({ taxonClassSlug, taxonSpeciesSlug, riskRatingIucnId, ...rest }) =>
      ({
        ...rest,
        taxonSlug: taxonClassSlug,
        slug: taxonSpeciesSlug,
        riskId: riskRatingIucnId
      })
    )
  }
}
