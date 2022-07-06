import { attributes, AttributeTypes } from '../type-helpers'

export interface TaxonClass {
  id: number
  idArbimon: number
  slug: string
  commonName: string
}

export const ATTRIBUTES_TAXON_CLASS = attributes<TaxonClass>()({
  light: ['id', 'slug', 'commonName']
})

export type TaxonClassTypes = AttributeTypes< TaxonClass, typeof ATTRIBUTES_TAXON_CLASS>
