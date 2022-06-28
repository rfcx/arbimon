import { attributes, AttributeTypes } from '../type-helpers'

export interface TaxonSpecies {
  id: number
  idArbimon: number
  slug: string
  taxonClassId: number
  scientificName: string
}

export const ATTRIBUTES_TAXON_SPECIES = attributes<TaxonSpecies>()({
  full: ['idArbimon', 'slug', 'taxonClassId', 'scientificName']
})
