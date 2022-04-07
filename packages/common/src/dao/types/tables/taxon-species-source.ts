import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesSource {
  id: number
  name: string
  priority: number
}

export const ATTRIBUTES_TAXON_SPECIES_SOURCE: AttributeConstants<TaxonSpeciesSource> = {
}
