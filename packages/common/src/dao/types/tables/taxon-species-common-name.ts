import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesCommonName {
  taxonSpeciesId: number
  taxonSpeciesSourceId: number
  sourceUrl: string
  commonName: string
}

export const ATTRIBUTES_TAXON_SPECIES_IUCN: AttributeConstants<TaxonSpeciesCommonName> = {
  updateOnDuplicate: ['sourceUrl', 'commonName']
}
