import { DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectProfile } from '@rfcx-bio/common/dao/types'
import { DashboardSpeciesHighlighted } from '@rfcx-bio/common/dao/types/dashboard-species-highlighted'

import { getSequelize } from '../_services/db'

export const getDashboardProfile = async (projectId: number): Promise<DashboardProfileResponse | undefined> => {
  const projectProfile = await getProjectProfile(projectId)
  if (!projectProfile) return undefined

  const speciesHighlightedRaw = await getHighlightedSpecies(projectId)

  return {
    ...projectProfile,
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

const getProjectProfile = async (projectId: number): Promise<LocationProjectProfile | undefined> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId: projectId },
      attributes: ['summary', 'readme'],
      raw: true
    }) ?? undefined

const getHighlightedSpecies = async (projectId: number): Promise<DashboardSpeciesHighlighted[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesHighlighted
    .findAll({
      where: { locationProjectId: projectId },
      order: [['highlightedOrder', 'ASC']],
      raw: true
    })
