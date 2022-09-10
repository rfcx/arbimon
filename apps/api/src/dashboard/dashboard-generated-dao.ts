import { ApiLine, ApiMap, ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectMetricTypes } from '@rfcx-bio/common/dao/types/location-project-metric'

import { getSequelize } from '../_services/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<LocationProjectMetricTypes['light']> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .LocationProjectMetric
    .findOne({
      attributes: {
        exclude: ['locationProjectId']
      },
      where: { locationProjectId },
      raw: true
    })

  return result ?? { detectionMinutesCount: 0, siteCount: 0, speciesCount: 0, maxDate: null, minDate: null }
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

export const getRichnessBySite = async (locationProjectId: number): Promise<ApiMap> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessBySite
    .findAll({
      where: { locationProjectId },
      attributes: ['name', 'latitude', 'longitude', ['richness', 'value']],
      raw: true
    }) as unknown as ApiMap

export const getDetectionBySite = async (locationProjectId: number): Promise<ApiMap> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardDetectionBySite
    .findAll({
      where: { locationProjectId },
      attributes: ['name', 'latitude', 'longitude', ['count', 'value']],
      raw: true
    }) as unknown as ApiMap

export const getRichnessByHour = async (locationProjectId: number): Promise<ApiLine> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByHour
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return Object.fromEntries(
    result.map(r => [r.hour, r.richness])
  )
}

export const getDetectionByHour = async (locationProjectId: number): Promise<ApiLine> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .DashboardDetectionByHour
    .findAll({
      where: { locationProjectId },
      raw: true
    })

  return Object.fromEntries(
    result.map(r => [r.hour, r.count])
  )
}
