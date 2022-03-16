export interface TaxonSpecies {
  id: number
  idArbimon: number
  slug: string
  taxonClassId: number
  scientificName: string
}

export const ATTRIBUTES_TAXON_SPECIES: Record<string, Array<keyof TaxonSpecies>> = {
  pks: ['id'],
  updateOnDuplicate: ['scientificName'],
  full: ['idArbimon', 'slug', 'taxonClassId', 'scientificName']
}
