import { groupBy, mapValues, sum } from 'lodash-es'

import { ApiMap } from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DashboardRichnessByRisk } from '@rfcx-bio/common/dao/types/dashboard-richness-by-risk'
import { DashboardRichnessByTaxon } from '@rfcx-bio/common/dao/types/dashboard-richness-by-taxon'
import { DashboardSpeciesThreatened } from '@rfcx-bio/common/dao/types/dashboard-species-threatened'
import { LocationProjectMetric } from '@rfcx-bio/common/dao/types/location-project-metric'
import { rawDetections } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { getSequelize } from '../_services/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<LocationProjectMetric | undefined> =>
  await ModelRepository.getInstance(getSequelize())
    .LocationProjectMetric
    .findOne({
      where: { locationProjectId },
      raw: true
     }) ?? undefined

export const getSpeciesThreatened = async (locationProjectId: number): Promise<DashboardSpeciesThreatened[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardSpeciesThreatened
    .findAll({
      where: { locationProjectId },
      raw: true
    })

export const getRichnessByTaxon = async (locationProjectId: number): Promise<DashboardRichnessByTaxon[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByTaxon
    .findAll({
      where: { locationProjectId },
      raw: true
    })

export const getRichnessByRisk = async (locationProjectId: number): Promise<DashboardRichnessByRisk[]> =>
  await ModelRepository.getInstance(getSequelize())
    .DashboardRichnessByRisk
    .findAll({
      where: { locationProjectId },
      raw: true
    })

// OLD, not GOLD (gonna delete this)
export const getRichnessByHour = async (): Promise<Record<number, number>> =>
  mapValues(groupByNumber(rawDetections, d => d.hour), detections => new Set(detections.map(d => d.species_id)).size)

export const getRichnessBySite = async (): Promise<ApiMap> =>
  Object.values(
    mapValues(
      groupBy(rawDetections, 'stream_id'),
      (detections) => ({
        name: detections[0].name,
        longitude: detections[0].lon,
        latitude: detections[0].lat,
        value: new Set(detections.map(d => d.species_id)).size
      })
    )
  )

export const getDetectionByHour = async (): Promise<Record<number, number>> => {
  return mapValues(groupByNumber(rawDetections, d => d.hour), detections => {
    return sum(detections.map(d => d.num_of_recordings))
  })
}

export const getDetectionBySite = async (): Promise<ApiMap> =>
  Object.values(
    mapValues(
      groupBy(rawDetections, 'stream_id'),
      (detections) => {
        const detectionCount = sum(detections.map(d => d.num_of_recordings))
        return {
          name: detections[0].name,
          longitude: detections[0].lon,
          latitude: detections[0].lat,
          value: detectionCount
        }
      }
    )
  )
