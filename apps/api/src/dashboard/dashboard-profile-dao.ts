import { DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectProfile } from '@rfcx-bio/common/dao/types'
import { DashboardSpeciesHighlighted } from '@rfcx-bio/common/dao/types/dashboard-species-highlighted'

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

const getProjectProfile = async (projectId: number): Promise<ProjectProfile> =>
  await ModelRepository.getInstance(getSequelize())
    .ProjectProfile
    .findOne({
      where: { projectId },
      attributes: ['summary', 'readme'],
      raw: true
    }) ?? { projectId, summary: '', readme: '' }

const getHighlightedSpecies = async (projectId: number): Promise<DashboardSpeciesHighlighted[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesHighlighted
    .findAll({
      where: { projectId },
      order: [['highlightedOrder', 'ASC']],
      raw: true
    })
