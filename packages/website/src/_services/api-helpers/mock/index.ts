import { groupBy, mapValues } from 'lodash'

import { DatasetDefinition, OptionalFilter } from '~/api/types'
import rawDetections from './raw-PR-data.json'
import rawSites from './raw-sites.json'

// TODO 132 - Encapsulate API response types in the API, and return project types
export interface ApiSite {
  'site_id': string
  'name': string
  'latitude': string
  'longitude': string
}

export interface ApiDetection {
  'arbimon_site_id': number
  'stream_id': string
  'name': string
  'lat': number
  'lon': number
  'alt': number
  'date': string // ex: "2021-04-01T00:00:00.000Z"
  'hour': number
  'species_id': number
  'scientific_name': string
  'taxon_id': number
  'taxon': string
  'num_of_recordings': number
  'detection_frequency': number
}

const MOCK_FLIGHT_TIME = 250 // TODO ?? - Consider longer delay to simulate a real API call

export const simulateDelay = async <T>(result: T, delay: number | undefined = undefined): Promise<T> =>
  delay === 0
    ? result
    : await new Promise((resolve) => setTimeout(() => resolve(result), delay ?? MOCK_FLIGHT_TIME))

export function getRawSites (): ApiSite[] {
  return rawSites
}

export const getRawDetections = (): ApiDetection[] => {
  return rawDetections
}

export const filterByDataset = (detections: ApiDetection[], dataset: DatasetDefinition): ApiDetection[] => {
  const { start, end, sites, otherFilters } = dataset
  const optionalFilters = groupBy(otherFilters, 'title')
  const getFilterValue = (filters: OptionalFilter[]): string => filters.map(f => f.value).join(', ')
  const groupedOptionalFilters = mapValues(optionalFilters, getFilterValue)
  const taxonFilters = groupedOptionalFilters.taxon ?? []
  const speciesFilter = groupedOptionalFilters.species ?? []
  return detections.filter(r => {
    return r.date >= start && r.date < end &&
    (sites.length === 0 || sites.map(s => s.siteId).includes(r.stream_id)) &&
    ((taxonFilters.length === 0 || taxonFilters.includes(r.taxon)) &&
    (speciesFilter.length === 0 || speciesFilter.includes(`${r.species_id}`)))
  })
}

export const filterBySpecies = (detections: ApiDetection[], speciesId: number): ApiDetection[] => {
  return detections.filter(r => r.species_id === speciesId)
}
