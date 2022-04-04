import { AttributeConstants } from '../../type-helpers'

export interface TaxonClass {
  id: number
  idArbimon: number
  slug: string
  commonName: string
}

export const ATTRIBUTES_TAXON_CLASS: AttributeConstants<TaxonClass> = {
  light: ['id', 'slug', 'commonName']
}
