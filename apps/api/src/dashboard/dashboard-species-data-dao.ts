import { type ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { type DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type DashboardSpeciesHighlighted } from '@rfcx-bio/common/dao/types/dashboard-species-highlighted'

import { getSequelize } from '~/db'

export const getHighlightedSpecies = async (projectId: number): Promise<DashboardSpeciesHighlighted[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesHighlighted
    .findAll({
      where: { locationProjectId: projectId },
      order: [['highlightedOrder', 'ASC']],
      raw: true
    })

export const getRichnessByTaxon = async (locationProjectId: number): Promise<ApiStack> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByTaxon
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return result.map(r => [r.taxonClassId, r.count])
}

export const getRichnessByRisk = async (locationProjectId: number): Promise<ApiStack> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByRisk
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return result.map(r => [r.riskRatingId, r.count])
}

export const getSpeciesThreatened = async (locationProjectId: number): Promise<DashboardSpecies[]> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesThreatened
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return result.map(({ taxonSpeciesSlug, taxonClassSlug, scientificName, commonName, riskRatingId, photoUrl }) => ({
    slug: taxonSpeciesSlug,
    taxonSlug: taxonClassSlug,
    scientificName,
    commonName,
    riskId: riskRatingId,
    photoUrl
  }))
}
