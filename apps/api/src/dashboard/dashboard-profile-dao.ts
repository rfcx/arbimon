import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectProfile } from '@rfcx-bio/common/dao/types'
import { DashboardSpeciesHighlighted } from '@rfcx-bio/common/dao/types/dashboard-species-highlighted'

import { getSequelize } from '../_services/db'

export const getProjectProfile = async (projectId: number): Promise<LocationProjectProfile | undefined> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectProfile
    .findOne({
      where: { locationProjectId: projectId },
      raw: true
    }) ?? undefined

export const getHighlightedSpecies = async (projectId: number): Promise<DashboardSpeciesHighlighted[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesHighlighted
    .findAll({
      where: { locationProjectId: projectId },
      order: [['highlightedOrder', 'ASC']],
      raw: true
    })
