import { TaxonClass } from '@/dao/types'

 const masterTaxonClasses = <const>[
  { id: -1, idArbimon: 6, slug: 'others', commonName: 'Others' },
  { id: 100, idArbimon: 2, slug: 'amphibians', commonName: 'Amphibians' },
  { id: 200, idArbimon: 4, slug: 'bats', commonName: 'Bats' },
  { id: 300, idArbimon: 1, slug: 'birds', commonName: 'Birds' },
  { id: 400, idArbimon: 8, slug: 'fish', commonName: 'Fish' },
  { id: 500, idArbimon: 3, slug: 'insects', commonName: 'Insects' },
  { id: 600, idArbimon: 5, slug: 'mammals', commonName: 'Mammals' }
]

export type TaxonClassId = typeof masterTaxonClasses[number]['id']
export const taxonClasses: readonly TaxonClass[] = masterTaxonClasses
