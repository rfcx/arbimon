import { DatasetDefinition } from '~/api/types'
import rawSites from './raw-site-01-07-apr-2021.json'
import rawDetections from './raw-species-richness-data-01-07-apr-2021.json'

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
  'date': string // ex: "2021-04-01T00:00:00.000Z"
  'hour': number
  'species_id': number
  'scientific_name': string
  'taxon_id': number
  'taxon': string
  'detection_frequency': number
}

const MOCK_FLIGHT_TIME = 250 // TODO ?? - Consider longer delay to simulate a real API call

export const simulateDelay = async <T>(result: T): Promise<T> =>
  await new Promise((resolve) => setTimeout(() => resolve(result), MOCK_FLIGHT_TIME))

export function getRawSites (): ApiSite[] {
  return rawSites
}

export const getRawDetections = (): ApiDetection[] => {
  return rawDetections
}

export const filterByDataset = (detections: ApiDetection[], dataset: DatasetDefinition): ApiDetection[] => {
  const { start, end, sites } = dataset
  return detections.filter(r => r.date >= start && r.date < end && (sites.length === 0 || sites.map(s => s.siteId).includes(r.stream_id)))
}

export const filterBySpecies = (detections: ApiDetection[], speciesId: number): ApiDetection[] => {
  return detections.filter(r => r.species_id === speciesId)
}
