import { Species } from '@rfcx-bio/common/api-bio/species/species'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

export type ArbimonHourlyDetectionSummary = Omit<MockHourlyDetectionSummary, 'detection_frequency'>

export type ArbimonSpeciesData = Pick<Species, 'speciesId' | 'speciesSlug' | 'scientificName' | 'taxonId' | 'taxon' | 'speciesCall'>

export interface ArbimonSpeciesCallRow {
  'scientific_name': string
  'songtype': string
  'start': string
  'end': string
  'stream_id': string
  'stream_name': string
  'project_id': string
  'project_name': string
  'timezone': string
}
