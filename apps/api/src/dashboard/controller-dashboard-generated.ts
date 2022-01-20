import { groupBy, mapValues, sum, sumBy } from 'lodash-es'

import { ApiMap } from '@rfcx-bio/common/api-bio/_helpers'
import { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { EXTINCTION_RISK_THREATENED_CODES, ExtinctionRisk, ExtinctionRiskCode, getExtinctionRisk } from '@rfcx-bio/common/iucn'
import { rawDetections, rawSites, rawSpecies } from '@rfcx-bio/common/mock-data'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { Controller } from '../_services/api-helper/types'
import { assertParamsExist } from '../_services/validation'

export const dashboardGeneratedController: Controller<DashboardGeneratedResponse, DashboardGeneratedParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query & Response
  return await getGeneratedData()
}

async function getGeneratedData (): Promise<DashboardGeneratedResponse> {
  const speciesThreatened = await getSpeciesThreatened()

  return {
    detectionCount: await getDetectionCount(),
    siteCount: rawSites.length,
    speciesCount: rawSpecies.length,
    speciesThreatenedCount: speciesThreatened.length,
    speciesThreatened,
    richnessByExtinction: await getRichnessByExtinction(),
    richnessByHour: await getRichnessByHour(),
    richnessBySite: await getRichnessBySite(),
    richnessByTaxon: await getRichnessByTaxon(),
    detectionFrequencyByHour: await getDetectionByHour(),
    detectionFrequencyBySite: await getDetectionBySite()
  }
}

const getDetectionCount = async (): Promise<number> =>
  sumBy(rawDetections, 'num_of_recordings')

const getSpeciesThreatened = async (): Promise<DashboardSpecies[]> =>
  rawSpecies
    .filter(species => EXTINCTION_RISK_THREATENED_CODES.includes(species.extinctionRisk))
    .sort((a, b) =>
      EXTINCTION_RISK_THREATENED_CODES.indexOf(b.extinctionRisk) - EXTINCTION_RISK_THREATENED_CODES.indexOf(a.extinctionRisk) ||
      a.scientificName.localeCompare(b.scientificName)
    )

const getRichnessByExtinction = async (): Promise<Array<[string, number]>> =>
  Object.entries(groupBy(rawSpecies, 'extinctionRisk'))
    .map(([extinctionCode, speciesList]) => [
      getExtinctionRisk(extinctionCode as ExtinctionRiskCode),
      speciesList.length
    ] as [ExtinctionRisk, number])
    .sort((a, b) => b[0].level - a[0].level)
    .map(([extinctionRisk, speciesCount]) => [extinctionRisk.label, speciesCount])

const getRichnessByHour = async (): Promise<Record<number, number>> =>
  mapValues(groupByNumber(rawDetections, d => d.hour), detections => new Set(detections.map(d => d.species_id)).size)

const getRichnessBySite = async (): Promise<ApiMap> =>
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

const getRichnessByTaxon = async (): Promise<Array<[string, number]>> =>
  Object.entries(groupBy(rawSpecies, 'taxon'))
    .map(([taxon, species]) => [taxon, species.length] as [string, number])
    .sort((a, b) => b[1] - a[1])

const getDetectionByHour = async (): Promise<Record<number, number>> => {
  return mapValues(groupByNumber(rawDetections, d => d.hour), detections => {
    return sum(detections.map(d => d.num_of_recordings))
  })
}

const getDetectionBySite = async (): Promise<ApiMap> =>
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
