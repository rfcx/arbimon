import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesCommonName {
  taxonSpeciesId: number
  taxonSpeciesSourceId: number
  commonName: string
}

export const ATTRIBUTES_TAXON_SPECIES_COMMON_NAME: AttributeConstants<TaxonSpeciesCommonName> = {
}
