import { groupBy, mapValues } from 'lodash'

import rawDetections from '@/api/raw-species-richness-data-01-07-apr-2021.json'
import { DetectionModels, TaxonomyModels } from '@/models'
import { MapSiteData } from '@/models/Chart'
import { SpeciesRichnessData, SpeciesRichnessDataset } from './species-service'

export * from './species-service'

interface ApiDetection {
  'arbimon_site_id': number
  'stream_id': string
  'name': string
  'lat': number
  'lon': number
  'date': string
  'hour': number
  'species_id': number
  'scientific_name': string
  'taxon_id': number
  'taxon': string
  'num_of_recordings': number
}

const MOCK_FLIGHT_TIME = 250 // TODO ?? - Consider longer delay to simulate a real API call

export async function getAllSpecies (): Promise<TaxonomyModels.Species[]> {
  const detectionsBySpeciesId = groupBy(rawDetections, 'species_id')
  const speciesBySpeciesId = mapValues(detectionsBySpeciesId, (value, key) => ({
    speciesId: Number(key),
    speciesName: value[0].scientific_name,
    className: value[0].taxon
  }))
  return Object.values(speciesBySpeciesId)
}

export async function getAllDetections (dataset: SpeciesRichnessDataset): Promise<DetectionModels.Detection[]> {
  const filteredDetections = filterByDataset(rawDetections, dataset)
  return filteredDetections
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
        numberOfRecordings: d.num_of_recordings
      }
    })
}

// TODO ?? - Move this logic to the API
export async function getSpeciesRichnessData (dataset: SpeciesRichnessDataset): Promise<SpeciesRichnessData> {
  const filteredDetections = filterByDataset(rawDetections, dataset)

  return await new Promise(resolve => setTimeout(() => resolve({
    ...dataset,
    detectionCount: filteredDetections.length,
    speciesByTaxon: getSpeciesByTaxon(filteredDetections),
    speciesBySite: getSpeciesBySite(filteredDetections),
    speciesPresence: getSpeciesPresence(filteredDetections)
  }), MOCK_FLIGHT_TIME))
}

function filterByDataset (detections: ApiDetection[], dataset: SpeciesRichnessDataset): ApiDetection[] {
  const { start, end, sites } = dataset
  return detections.filter(r => r.date >= start && r.date < end && (sites.length === 0 || sites.map(s => s.id).includes(r.stream_id)))
}

function getSpeciesByTaxon (detections: ApiDetection[]): { [taxon: string]: number } {
  const detectionsByTaxon = groupBy(detections, 'taxon') // TODO ?? - Extract field names
  return mapValues(detectionsByTaxon, (value) => new Set(value.map(d => d.species_id)).size)
}

function getSpeciesBySite (detections: ApiDetection[]): MapSiteData[] {
  const detectionsBySite = groupBy(detections, 'name') // TODO ?? - Extract field names
  const mapDataBySite = mapValues(detectionsBySite, (detections, siteId) => ({
    siteId,
    longitude: detections[0].lon,
    latitude: detections[0].lat,
    distinctSpecies: mapValues(groupBy(detections, 'taxon'), ds => new Set(ds.map(d => d.species_id)).size)
  }))

  return Object.values(mapDataBySite)
}

function getSpeciesPresence (detections: ApiDetection[]): { [speciesId: string]: TaxonomyModels.Species } {
  const detectionsBySpecies = groupBy(detections, 'species_id')
  return mapValues(detectionsBySpecies, (value, key) => ({
    speciesId: Number(key),
    speciesName: value[0].scientific_name,
    className: value[0].taxon
  }))
}
