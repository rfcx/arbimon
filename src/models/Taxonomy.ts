export interface TaxonomyOption {
  symbol: string
  name: string
}

export const TAXONOMY_CLASS_ALL: TaxonomyOption = { name: 'All', symbol: 'Σ' }
export const TAXONOMY_CLASSES: TaxonomyOption[] = [TAXONOMY_CLASS_ALL, { name: 'Amphibians', symbol: '🐸' }, { name: 'Birds', symbol: '🐦' }]

export interface Species {
  speciesSlug: string
  speciesId: number
  speciesName: string
  className: string
}
