import { TaxonomyClass } from '../types'

export const TAXONOMY_CLASS_ALL: TaxonomyClass = { name: 'All', symbol: 'Σ' }
export const TAXONOMY_CLASSES: TaxonomyClass[] = [
  TAXONOMY_CLASS_ALL,
  { name: 'Amphibians', symbol: '🐸' },
  { name: 'Birds', symbol: '🐦' },
  { name: 'Mammals', symbol: '🐗' }
]

export const TAXONOMY_UNKNOWN_CLASS: TaxonomyClass = { name: 'unknown', symbol: '❓' }
