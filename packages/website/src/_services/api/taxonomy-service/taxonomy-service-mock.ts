import { TaxonomyClass } from '../types'

export const TAXONOMY_CLASS_ALL: TaxonomyClass = { name: 'All', symbol: 'Σ' }

export const TAXONOMY_CLASSES: TaxonomyClass[] = [
  { name: 'Amphibians', symbol: '🐸' },
  { name: 'Birds', symbol: '🐦' },
  { name: 'Mammals', symbol: '🐗' }
]

export const TAXONOMY_CLASSES_WITH_ALL: TaxonomyClass[] = [TAXONOMY_CLASS_ALL, { name: 'Amphibians', symbol: '🐸' }, { name: 'Birds', symbol: '🐦' }] // TODO: remove this in #267
