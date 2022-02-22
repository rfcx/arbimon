import { groupBy, mapValues, sum } from 'lodash-es'

import { ApiMap } from '@rfcx-bio/common/api-bio/_helpers'
import { ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
import { DashboardSpeciesThreatened } from '@rfcx-bio/common/dao/types/dashboard-species-threatened'
import { LocationProjectMetric } from '@rfcx-bio/common/dao/types/location-project-metric'
import { ExtinctionRisk, ExtinctionRiskCode, getExtinctionRisk } from '@rfcx-bio/common/iucn'
import { rawDetections, rawSpecies } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { getSequelize } from '../_services/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<LocationProjectMetric | undefined> =>
  await ModelRepositoryFactory.getInstance(getSequelize())
    .LocationProjectMetric
    .findOne({
      where: { locationProjectId },
      raw: true
     }) ?? undefined

export const getSpeciesThreatened = async (locationProjectId: number): Promise<DashboardSpeciesThreatened[]> =>
  await ModelRepositoryFactory.getInstance(getSequelize())
    .DashboardSpeciesThreatened
    .findAll({
      where: { locationProjectId },
      raw: true
    })

// OLD, not GOLD (gonna delete this)
export const getRichnessByExtinction = async (): Promise<Array<[string, number]>> =>
  Object.entries(groupBy(rawSpecies, 'extinctionRisk'))
    .map(([extinctionCode, speciesList]) => [
      getExtinctionRisk(extinctionCode as ExtinctionRiskCode),
      speciesList.length
    ] as [ExtinctionRisk, number])
    .sort((a, b) => b[0].level - a[0].level)
    .map(([extinctionRisk, speciesCount]) => [extinctionRisk.label, speciesCount])

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

export const getRichnessByTaxon = async (): Promise<Array<[string, number]>> =>
  Object.entries(groupBy(rawSpecies, 'taxon'))
    .map(([taxon, species]) => [taxon, species.length] as [string, number])
    .sort((a, b) => b[1] - a[1])

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
