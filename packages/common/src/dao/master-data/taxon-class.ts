import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { TaxonClass } from '@/dao/types'

export const masterTaxonClasses = <const>{
  Amphibians: { id: 100, idArbimon: 2, slug: 'amphibians', commonName: 'Amphibians' },
  Bats: { id: 200, idArbimon: 4, slug: 'bats', commonName: 'Bats' },
  Birds: { id: 300, idArbimon: 1, slug: 'birds', commonName: 'Birds' },
  Fish: { id: 400, idArbimon: 8, slug: 'fish', commonName: 'Fish' },
  Insects: { id: 500, idArbimon: 3, slug: 'insects', commonName: 'Insects' },
  Mammals: { id: 600, idArbimon: 5, slug: 'mammals', commonName: 'Mammals' },
  Others: { id: 999, idArbimon: 6, slug: 'others', commonName: 'Others' }
}

export type TaxonClassId = ValueOf<typeof masterTaxonClasses>['id']
export const taxonClasses: readonly TaxonClass[] = Object.values(masterTaxonClasses)
