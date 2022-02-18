import { keyBy, mapValues } from 'lodash-es'

// TODO : Delete this file and use database instead
export interface TaxonClass {
  id: number
  idArbimon: number
  slug: string
  name: string
  symbol: string
  color: string
}

export const TAXONOMY_CLASS_ALL: TaxonClass = { id: 0, idArbimon: 0, name: 'All', slug: 'all', symbol: 'Σ', color: '#000000' }
export const TAXONOMY_UNKNOWN_CLASS: TaxonClass = { id: -1, idArbimon: -1, name: 'unknown', slug: 'unknown', symbol: '❓', color: '#000000' }

export const TAXONOMY_CLASSES: TaxonClass[] = [
  { id: 1, idArbimon: 2, name: 'Amphibians', slug: 'amphibians', symbol: '🐸', color: '#02A84F' },
  { id: 2, idArbimon: 4, name: 'Bats', slug: 'bats', symbol: '🦇', color: '#0B378A' },
  { id: 3, idArbimon: 1, name: 'Birds', slug: 'birds', symbol: '🐦', color: '#E043A9' },
  { id: 4, idArbimon: 8, name: 'Fish', slug: 'fish', symbol: '🐟', color: '#1259DE' },
  { id: 5, idArbimon: 3, name: 'Insects', slug: 'insects', symbol: '🦟', color: '#A80915' },
  { id: 6, idArbimon: 5, name: 'Mammals', slug: 'mammals', symbol: '🐗', color: '#F5A700' },
  { id: 7, idArbimon: 6, name: 'Others', slug: 'others', symbol: '❔', color: '#B177FC' }
]

export const TAXONOMY_COLORS = mapValues(keyBy(TAXONOMY_CLASSES, 'name'), 'color')
