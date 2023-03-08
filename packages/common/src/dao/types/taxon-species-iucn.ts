import { type AttributeTypes, attributes } from '../type-helpers'

export interface TaxonSpeciesIucn {
  taxonSpeciesId: number
  commonName: string
  riskRatingIucnId: number
  description: string
  descriptionSourceUrl: string
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_TAXON_SPECIES_IUCN = attributes<TaxonSpeciesIucn>()({
})

export type TaxonSpeciesIucnTypes = AttributeTypes< TaxonSpeciesIucn, typeof ATTRIBUTES_TAXON_SPECIES_IUCN>
