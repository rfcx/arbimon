import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesDescription {
  taxonSpeciesId: number
  taxonSpeciesSourceId: number
  sourceUrl: string
  description: string
}

export const ATTRIBUTES_TAXON_SPECIES_DESCRIPTION: AttributeConstants<TaxonSpeciesDescription> = {
}
