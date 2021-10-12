import { DatasetDefinition, MapModels, TaxonomyModels } from '@/models'

export type Period = 'hour' | 'day' | 'month' | 'year' | 'quarter'

export interface SpeciesRichnessData extends DatasetDefinition {
  detectionCount: number
  speciesByTaxon: { [taxon: string]: number }
  speciesBySite: MapModels.MapSiteData[]
  speciesByTime: Record<Period, Record<number, number>>
  speciesPresence: { [speciesId: string]: TaxonomyModels.Species }
}
