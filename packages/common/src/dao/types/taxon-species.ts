export interface TaxonSpecies {
  id: number
  idArbimon: number
  slug: string
  taxonClassId: number
  scientificName: string
}

export const ATTRIBUTES_TAXON_SPECIES: Record<string, Array<keyof TaxonSpecies>> = {
  full: ['idArbimon', 'slug', 'taxonClassId', 'scientificName']
}
