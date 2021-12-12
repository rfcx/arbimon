import { groupBy, keyBy, mapValues } from 'lodash-es'

import { SpeciesLight } from '@rfcx-bio/common/api-bio-types/species'
import { MockHourlyDetectionSummary, rawDetections, rawSpecies, simulateDelay } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { DatasetParameters, filterMocksByParameters } from '~/filters'
import { MapSiteData } from '~/maps/map-bubble'
import { SpeciesRichnessData, TimeBucket } from './types'

// TODO ?? - Move this logic to the API
export const getSpeciesRichnessData = async (dataset: DatasetParameters): Promise<SpeciesRichnessData> => {
  const filteredDetections = filterMocksByParameters(rawDetections, dataset)

  return await simulateDelay({
    ...dataset,
    detectionCount: filteredDetections.length,
    speciesByTaxon: getSpeciesByTaxon(filteredDetections),
    speciesBySite: getSpeciesBySite(filteredDetections),
    speciesByTime: getSpeciesByTime(filteredDetections),
    speciesPresence: getSpeciesPresence(filteredDetections)
  })
}

const calculateSpeciesRichness = (detections: MockHourlyDetectionSummary[]): number => new Set(detections.map(d => d.species_id)).size

const getSpeciesByTaxon = (detections: MockHourlyDetectionSummary[]): { [taxon: string]: number } => {
  const detectionsByTaxon = groupBy(detections, 'taxon') // TODO ?? - Extract field names
  return mapValues(detectionsByTaxon, calculateSpeciesRichness)
}

const getSpeciesBySite = (detections: MockHourlyDetectionSummary[]): MapSiteData[] => {
  const detectionsBySite = groupBy(detections, 'name') // TODO ?? - Extract field names
  const mapDataBySite = mapValues(detectionsBySite, (detections, siteName) => ({
    siteName,
    longitude: detections[0].lon,
    latitude: detections[0].lat,
    distinctSpecies: mapValues(groupBy(detections, 'taxon'), calculateSpeciesRichness)
  }))

  return Object.values(mapDataBySite)
}

const getSpeciesByTime = (detections: MockHourlyDetectionSummary[]): Record<TimeBucket, Record<number, number>> => {
  return {
    hour: mapValues(groupByNumber(detections, d => d.hour), calculateSpeciesRichness),
    day: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).date()), calculateSpeciesRichness),
    month: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).month() + 1), calculateSpeciesRichness),
    year: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).year()), calculateSpeciesRichness),
    quarter: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).quarter()), calculateSpeciesRichness)
  }
}

const getSpeciesPresence = (detections: MockHourlyDetectionSummary[]): { [speciesId: string]: SpeciesLight } => {
  const speciesIds = new Set(detections.map(d => d.species_id))

  const species = rawSpecies
    .filter(s => speciesIds.has(s.speciesId))
    .map(({ speciesId, speciesSlug, scientificName, commonName, taxon: taxonClass }) =>
      ({ speciesId, speciesSlug, scientificName, commonName, taxonClass }))
    return keyBy(species, 'speciesId')
}
