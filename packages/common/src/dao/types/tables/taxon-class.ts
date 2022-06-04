import { TypesFor } from '@/dao/type-helpers'

export interface TaxonClass {
  id: number
  idArbimon: number
  slug: string
  commonName: string
}

export const ATTRIBUTES_TAXON_CLASS = {
  light: ['id', 'slug', 'commonName']
} as const

export type TaxonClassTypes = TypesFor<TaxonClass, typeof ATTRIBUTES_TAXON_CLASS>
