import { groupBy, mapValues } from 'lodash'

import rawDetections from '@/api/raw-species-richness-data-01-07-apr-2021.json'
import { ChartModels, DetectionModels, SiteModels, TaxonomyModels } from '@/models'
import { MapSiteData } from '@/models/Chart'

interface SpeciesRichnessRequestParams {
  start: string
  end: string
  sites: SiteModels.Site[]
}

interface DetectionResponseParams {
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

function filterAPIData (options: SpeciesRichnessRequestParams): DetectionResponseParams[] {
  const { start, end, sites } = options
  return rawDetections.filter(r => r.date >= start && r.date < end && (sites.length === 0 || sites.map(s => s.id).includes(r.stream_id)))
}

export function getMockupSpecies (options: SpeciesRichnessRequestParams): Array<Omit<ChartModels.BarChartItem, 'color'>> {
  const filteredDetections = filterAPIData(options)
  const groupedDetections = groupBy(filteredDetections, 'taxon')
  const data = mapValues(groupedDetections, (value, key) => {
    return {
      category: key,
      frequency: new Set(value.map(d => d.species_id)).size
    }
  })

  return Object.values(data)
}

export function getSpeciesMapData (options: SpeciesRichnessRequestParams): MapSiteData[] {
  const filteredDetections = filterAPIData(options)
  return Object.values(mapValues(
    groupBy(filteredDetections, 'name'), // TODO 41 - Extract field names
    (detections, siteId) => ({
      siteId,
      longitude: detections[0].lon,
      latitude: detections[0].lat,
      distinctSpecies: mapValues(groupBy(detections, 'taxon'), ds => new Set(ds.map(d => d.species_id)).size)
    })
  ))
}

// TODO - 32 This function can combination
export function getSpeciesTableData (options: SpeciesRichnessRequestParams): TaxonomyModels.SpeciesPopulation[] {
  const filteredDetections = filterAPIData(options)
  const groupedDetections = groupBy(filteredDetections, 'species_id')
  const data = mapValues(groupedDetections, (value, _) => {
    return {
      speciesName: value[0].scientific_name,
      className: value[0].taxon,
      frequency: new Set(value.map(d => d.species_id)).size
    }
  })
  return Object.values(data)
}

export function getDetections (options: SpeciesRichnessRequestParams): DetectionModels.Detection[] {
  const filteredDetections = filterAPIData(options)
  return filteredDetections
    .sort((a, b) => a.date.localeCompare(b.date) || (a.name + a.scientific_name).localeCompare(b.name + b.scientific_name))
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
