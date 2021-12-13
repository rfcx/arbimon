import { SpeciesLight } from '@rfcx-bio/common/api-bio-types/species'

import { DatasetParameters } from '~/filters'
import { MapSiteData } from '~/maps/map-bubble'

export type TimeBucket = 'hour' | 'day' | 'month' | 'year' | 'quarter'

export interface SpeciesRichnessData extends DatasetParameters {
  detectionCount: number
  speciesByTaxon: { [taxon: string]: number }
  speciesBySite: MapSiteData[]
  speciesByTime: Record<TimeBucket, Record<number, number>>
  speciesPresence: { [speciesId: string]: SpeciesLight }
}
