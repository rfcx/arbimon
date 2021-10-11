import { SiteModels, TaxonomyModels } from '@/models'
import { MapSiteData } from '@/models/Chart'

export type Period = 'hour' | 'day' | 'month' | 'year' | 'quarter'

export interface SpeciesRichnessDataset {
  start: string
  end: string
  sites: SiteModels.Site[]
}

export interface SpeciesRichnessData extends SpeciesRichnessDataset {
  detectionCount: number
  speciesByTaxon: { [taxon: string]: number }
  speciesBySite: MapSiteData[]
  speciesByTime: Record<Period, Record<number, number>>
  speciesPresence: { [speciesId: string]: TaxonomyModels.Species }
}
