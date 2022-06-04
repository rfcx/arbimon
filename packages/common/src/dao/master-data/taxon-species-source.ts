import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { TaxonSpeciesSource } from '@/dao/types'

export const masterTaxonSpeciesSources = {
  RFCx: { id: -1, name: 'RFCx' },
  IUCN: { id: 100, name: 'IUCN' },
  Wikipedia: { id: 700, name: 'Wikipedia' }
} as const

export type TaxonSpeciesSourceId = ValueOf<typeof masterTaxonSpeciesSources>['id']
export const taxonSpeciesSources: readonly TaxonSpeciesSource[] = Object.values(masterTaxonSpeciesSources)
