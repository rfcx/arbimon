import { ApiLine, ApiMap, ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectMetricLight } from '@rfcx-bio/common/dao/types/location-project-metric'

import { getSequelize } from '../_services/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<LocationProjectMetricLight> => {
  const result = await ModelRepository.getInstance(getSequelize())
    .LocationProjectMetric
    .findOne({
      where: { locationProjectId },
      raw: true
    })

    return result ?? { detectionCount: 0, siteCount: 0, speciesCount: 0, maxDate: null, minDate: null }
}

export const getSpeciesThreatened = async (locationProjectId: number): Promise<DashboardSpecies[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesThreatened
    .findAll({
      where: { locationProjectId },
      raw: true
    })
    .then(res => res.map(({ taxonSpeciesSlug, taxonClassSlug, scientificName, commonName, riskRatingIucnId, photoUrl }) => ({
      slug: taxonSpeciesSlug,
      taxonSlug: taxonClassSlug,
      scientificName,
      commonName,
      riskId: riskRatingIucnId,
      photoUrl
    })))

export const getRichnessByTaxon = async (locationProjectId: number): Promise<ApiStack> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByTaxon
    .findAll({
      where: { locationProjectId },
      raw: true
    })
    .then(res => res.map(r => [r.taxonClassId, r.count]))

export const getRichnessByRisk = async (locationProjectId: number): Promise<ApiStack> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByRisk
    .findAll({
      where: { locationProjectId },
      raw: true
    })
    .then(res => res.map(r => [r.riskRatingIucnId, r.count]))

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

export const getRichnessByHour = async (locationProjectId: number): Promise<ApiLine> =>
  Object.fromEntries(
    await ModelRepository.getInstance(getSequelize())
      .DashboardRichnessByHour
      .findAll({
        where: { locationProjectId },
        raw: true
      })
      .then(res => res.map(r => [r.hour, r.richness]))
  )

export const getDetectionByHour = async (locationProjectId: number): Promise<ApiLine> =>
  Object.fromEntries(
    await ModelRepository.getInstance(getSequelize())
      .DashboardDetectionByHour
      .findAll({
        where: { locationProjectId },
        raw: true
      })
      .then(res => res.map(r => [r.hour, r.count]))
  )
