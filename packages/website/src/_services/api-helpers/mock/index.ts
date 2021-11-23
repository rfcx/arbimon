import { groupBy } from 'lodash'

import { DatasetDefinition } from '~/api/types'
import { rawSites } from './raw-sites'
import { rawSummaries } from './raw-summaries'

// TODO 132 - Encapsulate API response types in the API, and return project types
export interface ApiSite {
  'site_id': string
  'name': string
  'latitude': string
  'longitude': string
}

export interface ApiHourlySpeciesSummary {
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

export const getRawDetections = (): ApiHourlySpeciesSummary[] => {
  return rawSummaries
}

export const filterByDataset = (detections: ApiHourlySpeciesSummary[], dataset: DatasetDefinition): ApiHourlySpeciesSummary[] => {
  const { start, end, sites, otherFilters } = dataset

  const groupedFilters = groupBy(otherFilters, 'propertyName')
  const speciesFilters = groupedFilters.species ?? []
  const taxonFilters = groupedFilters.taxon ?? []

  if (taxonFilters.length > 1) return [] // Cannot be in multiple taxonomies

  return detections.filter(r =>
    r.date >= start &&
    r.date < end &&
    (sites.length === 0 || sites.map(s => s.siteId).includes(r.stream_id)) &&
    (taxonFilters.length === 0 || taxonFilters[0].value === r.taxon) &&
    (speciesFilters.length === 0 || speciesFilters.find(f => f.value === r.species_id.toString()))
  )
}

export const filterBySpecies = (detections: ApiHourlySpeciesSummary[], speciesId: number): ApiHourlySpeciesSummary[] => {
  return detections.filter(r => r.species_id === speciesId)
}
