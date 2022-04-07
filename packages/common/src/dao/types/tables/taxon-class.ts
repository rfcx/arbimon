import { TypesFor } from '@/dao/type-helpers'

export interface TaxonClass {
  id: number
  idArbimon: number
  slug: string
  commonName: string
}

export const ATTRIBUTES_TAXON_CLASS = <const>{
  light: ['id', 'slug', 'commonName']
}

export type TaxonClassTypes = TypesFor<TaxonClass, typeof ATTRIBUTES_TAXON_CLASS>
