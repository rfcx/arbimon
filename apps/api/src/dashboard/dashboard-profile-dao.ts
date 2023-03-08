import { type DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfile } from '@rfcx-bio/common/dao/types'
import { type DashboardSpeciesHighlighted } from '@rfcx-bio/common/dao/types/dashboard-species-highlighted'

import { getSequelize } from '../_services/db'

export const getDashboardProfile = async (projectId: number): Promise<DashboardProfileResponse> => {
  const [projectProfile, speciesHighlightedRaw] = await Promise.all([
    getProjectProfile(projectId),
    getHighlightedSpecies(projectId)
  ])

  return {
    ...projectProfile,
    speciesHighlighted: speciesHighlightedRaw.map(({ taxonClassSlug, taxonSpeciesSlug, riskRatingId, ...rest }) =>
      ({
        ...rest,
        taxonSlug: taxonClassSlug,
        slug: taxonSpeciesSlug,
        riskId: riskRatingId
      })
    )
  }
}

const getProjectProfile = async (locationProjectId: number): Promise<LocationProjectProfile> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId },
      attributes: ['summary', 'readme'],
      raw: true
    }) ?? { locationProjectId, summary: '', readme: '' }

const getHighlightedSpecies = async (projectId: number): Promise<DashboardSpeciesHighlighted[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesHighlighted
    .findAll({
      where: { locationProjectId: projectId },
      order: [['highlightedOrder', 'ASC']],
      raw: true
    })
