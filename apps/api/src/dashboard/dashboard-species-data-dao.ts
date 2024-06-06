import { Op } from 'sequelize'

import { type ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { type DashboardSpecies, type LocationProjectSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type TaxonSpecies } from '@rfcx-bio/node-common/dao/types'
import { type DashboardSpeciesHighlighted } from '@rfcx-bio/node-common/dao/types/dashboard-species-highlighted'

import { getSequelize } from '~/db'

export const getTotalSpecies = async (locationProjectId: number): Promise<number> => {
  const { LocationProjectMetric } = ModelRepository.getInstance(getSequelize())
  const metric = await LocationProjectMetric.findOne({
    attributes: ['speciesCount'],
    where: { locationProjectId },
    raw: true
  })
  return metric?.speciesCount ?? 0
}

export const getHighlightedSpecies = async (projectId: number): Promise<DashboardSpeciesHighlighted[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesHighlighted
    .findAll({
      where: { locationProjectId: projectId },
      order: [['highlightedOrder', 'ASC']],
      raw: true
    })

export const postHighlightedSpecies = async (species: LocationProjectSpecies[]): Promise<void> => {
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectSpecies
    .bulkCreate(species)
}

export const deleteHighlightedSpecies = async (species: LocationProjectSpecies[]): Promise<void> => {
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectSpecies
    .destroy({
      where: { locationProjectId: species[0].locationProjectId, taxonSpeciesId: { [Op.in]: species.map(sp => sp.taxonSpeciesId) } }
    })
}

export const getSpeciesBySlug = async (speciesIds: string[]): Promise<TaxonSpecies[]> => {
  return await ModelRepository.getInstance(getSequelize())
    .TaxonSpecies
    .findAll({
      where: { slug: { [Op.in]: speciesIds } },
      attributes: ['id', 'slug'],
      raw: true
    })
}

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
