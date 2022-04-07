import { AttributeConstants } from '../../type-helpers'

export interface TaxonClass {
  id: number
  idArbimon: number
  slug: string
  commonName: string
}

export type TaxonClassLight = Pick<TaxonClass, 'id' | 'slug' | 'commonName'>

export const ATTRIBUTES_TAXON_CLASS: AttributeConstants<TaxonClass> = {
  light: ['id', 'slug', 'commonName']
}
