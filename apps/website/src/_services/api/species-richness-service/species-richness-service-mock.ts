import { groupBy, kebabCase, mapValues } from 'lodash-es'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { groupByNumber } from '@rfcx-bio/utils/lodash-ext'

import { ApiHourlySpeciesSummary, filterByDataset, getRawDetections, simulateDelay } from '~/api-helpers/mock'
import { MapSiteData } from '~/maps/map-bubble'
import { DatasetDefinition, Species } from '..'
import { SpeciesRichnessData, TimeBucket } from './types'

// TODO ?? - Move this logic to the API
export const getSpeciesRichnessData = async (dataset: DatasetDefinition): Promise<SpeciesRichnessData> => {
  const filteredDetections = filterByDataset(getRawDetections(), dataset)

  return await simulateDelay({
    ...dataset,
    detectionCount: filteredDetections.length,
    speciesByTaxon: getSpeciesByTaxon(filteredDetections),
    speciesBySite: getSpeciesBySite(filteredDetections),
    speciesByTime: getSpeciesByTime(filteredDetections),
    speciesPresence: getSpeciesPresence(filteredDetections)
  })
}

const calculateSpeciesRichness = (detections: ApiHourlySpeciesSummary[]): number => new Set(detections.map(d => d.species_id)).size

const getSpeciesByTaxon = (detections: ApiHourlySpeciesSummary[]): { [taxon: string]: number } => {
  const detectionsByTaxon = groupBy(detections, 'taxon') // TODO ?? - Extract field names
  return mapValues(detectionsByTaxon, calculateSpeciesRichness)
}

const getSpeciesBySite = (detections: ApiHourlySpeciesSummary[]): MapSiteData[] => {
  const detectionsBySite = groupBy(detections, 'name') // TODO ?? - Extract field names
  const mapDataBySite = mapValues(detectionsBySite, (detections, siteName) => ({
    siteName,
    longitude: detections[0].lon,
    latitude: detections[0].lat,
    distinctSpecies: mapValues(groupBy(detections, 'taxon'), calculateSpeciesRichness)
  }))

  return Object.values(mapDataBySite)
}

const getSpeciesByTime = (detections: ApiHourlySpeciesSummary[]): Record<TimeBucket, Record<number, number>> => {
  return {
    hour: mapValues(groupByNumber(detections, d => d.hour), calculateSpeciesRichness),
    day: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).date()), calculateSpeciesRichness),
    month: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).month() + 1), calculateSpeciesRichness),
    year: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).year()), calculateSpeciesRichness),
    quarter: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).quarter()), calculateSpeciesRichness)
  }
}

const getSpeciesPresence = (detections: ApiHourlySpeciesSummary[]): { [speciesId: string]: Species } => {
  const detectionsBySpecies = groupBy(detections, 'species_id')
  return mapValues(detectionsBySpecies, (value, key) => ({
    speciesSlug: kebabCase(value[0].scientific_name),
    speciesId: Number(key),
    speciesName: value[0].scientific_name,
    className: value[0].taxon
  }))
}
