import { SpeciesLight } from '@rfcx-bio/common/api-bio/species/species'

import { DatasetParameters } from '~/filters'
import { MapSiteData } from '~/maps/map-bubble'
import { TimeBucket } from '~/time-buckets'

export interface SpeciesRichnessData extends DatasetParameters {
  detectionCount: number
  speciesByTaxon: { [taxon: string]: number }
  speciesBySite: MapSiteData[]
  speciesByTime: Record<TimeBucket, Record<number, number>>
  speciesPresence: { [speciesId: string]: SpeciesLight }
}
