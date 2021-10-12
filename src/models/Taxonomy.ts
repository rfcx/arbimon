export interface TaxonomyOption {
  symbol: string
  name: string
}

export const TAXONOMY_ALL: TaxonomyOption = { name: 'All', symbol: 'Σ' }
export const TAXONOMIES: TaxonomyOption[] = [TAXONOMY_ALL, { name: 'Amphibians', symbol: '🐸' }, { name: 'Birds', symbol: '🐦' }]

export interface Species {
  speciesSlug: string
  speciesId: number
  speciesName: string
  className: string
}
