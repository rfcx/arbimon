import { keyBy, mapValues } from 'lodash-es'

export interface TaxonomyClass {
  symbol: string
  name: string
  color: string
}

export const TAXONOMY_CLASS_ALL: TaxonomyClass = { name: 'All', symbol: 'Σ', color: '#000000' }
export const TAXONOMY_UNKNOWN_CLASS: TaxonomyClass = { name: 'unknown', symbol: '❓', color: '#000000' }

export const TAXONOMY_CLASSES: TaxonomyClass[] = [
  { name: 'Amphibians', symbol: '🐸', color: '#02A84F' },
  { name: 'Bats', symbol: '🦇', color: '#0B378A' },
  { name: 'Birds', symbol: '🐦', color: '#E043A9' },
  { name: 'Fish', symbol: '🐟', color: '#1259DE' },
  { name: 'Insects', symbol: '🦟', color: '#A80915' },
  { name: 'Mammals', symbol: '🐗', color: '#F5A700' },
  { name: 'Others', symbol: '❔', color: '#B177FC' }
]

export const TAXONOMY_COLORS = mapValues(keyBy(TAXONOMY_CLASSES, 'name'), 'color')
