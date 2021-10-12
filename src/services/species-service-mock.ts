import { groupBy, kebabCase, mapValues } from 'lodash'

import { DatasetDefinition, DetectionModels, MapModels, TaxonomyModels } from '@/models'
import { groupByNumber } from '@/utils/lodash-ext'
import { dayjs } from './dayjs-service'
import { ApiDetection, filterByDataset, getRawDetections, simulateDelay } from './mock-helper'
import { Period, SpeciesRichnessData } from './species-service'

export * from './species-service'

export const getAllSpecies = async (): Promise<TaxonomyModels.Species[]> => {
  const detectionsBySpeciesId = groupBy(getRawDetections(), 'species_id')
  const speciesBySpeciesId = mapValues(detectionsBySpeciesId, (value, key) => ({
    speciesSlug: kebabCase(value[0].scientific_name),
    speciesId: Number(key),
    speciesName: value[0].scientific_name,
    className: value[0].taxon
  }))
  return await simulateDelay(Object.values(speciesBySpeciesId))
}

export const getAllDetections = async (dataset: DatasetDefinition): Promise<DetectionModels.Detection[]> => {
  const filteredDetections = filterByDataset(getRawDetections(), dataset)
  return await simulateDelay(
    filteredDetections
      .sort((a, b) => a.scientific_name.localeCompare(b.scientific_name) || a.name.localeCompare(b.name) || a.date.localeCompare(b.date) || a.hour - b.hour)
      .map(d => {
        return {
          arbimonSiteId: d.arbimon_site_id,
          siteId: d.stream_id,
          siteName: d.name,
          latitude: d.lat,
          longitude: d.lon,
          date: d.date,
          hour: d.hour,
          speciesId: d.species_id,
          speciesName: d.scientific_name,
          classId: d.taxon_id,
          className: d.taxon,
          detectionFrequency: d.detection_frequency
        }
      })
  )
}

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

const getSpeciesByTaxon = (detections: ApiDetection[]): { [taxon: string]: number } => {
  const detectionsByTaxon = groupBy(detections, 'taxon') // TODO ?? - Extract field names
  return mapValues(detectionsByTaxon, (value) => new Set(value.map(d => d.species_id)).size)
}

const getSpeciesBySite = (detections: ApiDetection[]): MapModels.MapSiteData[] => {
  const detectionsBySite = groupBy(detections, 'name') // TODO ?? - Extract field names
  const mapDataBySite = mapValues(detectionsBySite, (detections, siteName) => ({
    siteName,
    longitude: detections[0].lon,
    latitude: detections[0].lat,
    distinctSpecies: mapValues(groupBy(detections, 'taxon'), ds => new Set(ds.map(d => d.species_id)).size)
  }))

  return Object.values(mapDataBySite)
}

const getSpeciesByTime = (detections: ApiDetection[]): Record<Period, Record<number, number>> => {
  return {
    hour: mapValues(groupByNumber(detections, d => d.hour), ds => ds.length),
    day: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).date()), ds => ds.length),
    month: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).month() + 1), ds => ds.length),
    year: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).year()), ds => ds.length),
    quarter: mapValues(groupByNumber(detections, d => dayjs.utc(d.date).quarter()), ds => ds.length)
  }
}

const getSpeciesPresence = (detections: ApiDetection[]): { [speciesId: string]: TaxonomyModels.Species } => {
  const detectionsBySpecies = groupBy(detections, 'species_id')
  return mapValues(detectionsBySpecies, (value, key) => ({
    speciesSlug: kebabCase(value[0].scientific_name),
    speciesId: Number(key),
    speciesName: value[0].scientific_name,
    className: value[0].taxon
  }))
}
