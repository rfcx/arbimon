import { groupBy, mapValues, sum } from 'lodash-es'

import { ApiMap, ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectMetricLight } from '@rfcx-bio/common/dao/types/location-project-metric'
import { rawDetections } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { getSequelize } from '../_services/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<LocationProjectMetricLight> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectMetric
    .findOne({
      where: { locationProjectId },
      raw: true
    })
    .then(res => res ?? { detectionCount: 0, siteCount: 0, speciesCount: 0 })

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
    .DashboardDetectionsBySite
    .findAll({
      where: { locationProjectId },
      attributes: ['name', 'latitude', 'longitude', ['count', 'value']],
      raw: true
    }) as unknown as ApiMap

// OLD, not GOLD (gonna delete this)
export const getRichnessByHour = async (): Promise<Record<number, number>> =>
  mapValues(groupByNumber(rawDetections, d => d.hour), detections => new Set(detections.map(d => d.species_id)).size)

export const getDetectionByHour = async (): Promise<Record<number, number>> => {
  return mapValues(groupByNumber(rawDetections, d => d.hour), detections => {
    return sum(detections.map(d => d.num_of_recordings))
  })
}
