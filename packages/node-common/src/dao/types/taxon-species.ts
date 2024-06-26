import { type AttributeTypes, attributes } from '../type-helpers'

export interface TaxonSpecies {
  id: number
  idArbimon: number
  slug: string
  taxonClassId: number
  scientificName: string
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_TAXON_SPECIES = attributes<TaxonSpecies>()({
  full: ['idArbimon', 'slug', 'taxonClassId', 'scientificName']
})

export type TaxonSpeciesTypes = AttributeTypes< TaxonSpecies, typeof ATTRIBUTES_TAXON_SPECIES>
