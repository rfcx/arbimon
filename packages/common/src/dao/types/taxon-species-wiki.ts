import { attributes, AttributeTypes } from '../type-helpers'

export interface TaxonSpeciesWiki {
  taxonSpeciesId: number
  description: string
  descriptionSourceUrl: string
}

export const ATTRIBUTES_TAXON_SPECIES_WIKI = attributes<TaxonSpeciesWiki>()({
})

export type TaxonSpeciesWikiTypes = AttributeTypes< TaxonSpeciesWiki, typeof ATTRIBUTES_TAXON_SPECIES_WIKI>
