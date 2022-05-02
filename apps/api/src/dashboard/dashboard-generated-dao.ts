import { ApiLine, ApiMap, ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectMetricLight } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '../_services/db'

export const getProjectMetrics = async (projectId: number): Promise<ProjectMetricLight> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .ProjectMetric
    .findOne({
      attributes: { exclude: ['locationProjectId'] },
      where: { projectId },
      raw: true
    })

  return result ?? { detectionCount: 0, siteCount: 0, speciesCount: 0, maxDate: null, minDate: null }
}

export const getSpeciesThreatened = async (projectId: number): Promise<DashboardSpecies[]> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesThreatened
    .findAll({
      where: { projectId },
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

export const getRichnessByTaxon = async (projectId: number): Promise<ApiStack> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByTaxon
    .findAll({
      where: { projectId },
      raw: true
    })

  return result.map(r => [r.taxonClassId, r.count])
}

export const getRichnessByRisk = async (projectId: number): Promise<ApiStack> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByRisk
    .findAll({
      where: { projectId },
      raw: true
    })

  return result.map(r => [r.riskRatingId, r.count])
}

export const getRichnessBySite = async (projectId: number): Promise<ApiMap> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessBySite
    .findAll({
      where: { projectId },
      attributes: ['name', 'latitude', 'longitude', ['richness', 'value']],
      raw: true
    }) as unknown as ApiMap

export const getDetectionBySite = async (projectId: number): Promise<ApiMap> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardDetectionBySite
    .findAll({
      where: { projectId },
      attributes: ['name', 'latitude', 'longitude', ['count', 'value']],
      raw: true
    }) as unknown as ApiMap

export const getRichnessByHour = async (projectId: number): Promise<ApiLine> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByHour
    .findAll({
      where: { projectId },
      raw: true
    })

  return Object.fromEntries(
    result.map(r => [r.hour, r.richness])
  )
}

export const getDetectionByHour = async (projectId: number): Promise<ApiLine> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardDetectionByHour
    .findAll({
      where: { projectId },
      raw: true
    })

  return Object.fromEntries(
    result.map(r => [r.hour, r.count])
  )
}
