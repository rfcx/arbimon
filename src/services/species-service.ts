import { SiteModels, TaxonomyModels } from '@/models'
import { MapSiteData } from '@/models/Chart'

export interface SpeciesRichnessDataset {
  start: string
  end: string
  sites: SiteModels.Site[]
}

export interface SpeciesRichnessData extends SpeciesRichnessDataset {
  detectionCount: number
  speciesByTaxon: { [taxon: string]: number }
  speciesBySite: MapSiteData[]
  speciesPresence: { [speciesId: string]: TaxonomyModels.Species }
}
