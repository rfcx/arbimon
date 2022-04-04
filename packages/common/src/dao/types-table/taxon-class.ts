export interface TaxonClass {
  id: number
  idArbimon: number
  slug: string
  commonName: string
}

export const ATTRIBUTES_TAXON_CLASS: Record<string, Array<keyof TaxonClass>> = {
  light: ['id', 'slug', 'commonName']
}
