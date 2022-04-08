import { TaxonSpeciesSource } from '@/dao/types'

export const masterTaxonSpeciesSources = <const>{
  RFCx: { id: -1, name: 'RFCx' },
  IUCN: { id: 100, name: 'IUCN' },
  Wikipedia: { id: 700, name: 'Wikipedia' }
}

export type TaxonSpeciesSourceId = typeof masterTaxonSpeciesSources[keyof typeof masterTaxonSpeciesSources]['id']
export const taxonSpeciesSources: readonly TaxonSpeciesSource[] = Object.values(masterTaxonSpeciesSources)
