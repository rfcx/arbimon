import { MapSiteData } from '@/_components/charts/map-bubble'
import { DatasetDefinition, Species } from '..'

export type TimeBucket = 'hour' | 'day' | 'month' | 'year' | 'quarter'

export interface SpeciesRichnessData extends DatasetDefinition {
  detectionCount: number
  speciesByTaxon: { [taxon: string]: number }
  speciesBySite: MapSiteData[]
  speciesByTime: Record<TimeBucket, Record<number, number>>
  speciesPresence: { [speciesId: string]: Species }
}
