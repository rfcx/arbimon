import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpecies {
  id: number
  idArbimon: number
  slug: string
  taxonClassId: number
  scientificName: string
}

export const ATTRIBUTES_TAXON_SPECIES: AttributeConstants<TaxonSpecies> = {
  pks: ['id'],
  updateOnDuplicate: ['scientificName', 'taxonClassId'],
  full: ['idArbimon', 'slug', 'taxonClassId', 'scientificName']
}
