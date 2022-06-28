export interface TaxonSpeciesWiki {
  taxonSpeciesId: number
  description: string
  descriptionSourceUrl: string
}

export const ATTRIBUTES_TAXON_SPECIES_WIKI: Record<string, Array<keyof TaxonSpeciesWiki>> = {
}
