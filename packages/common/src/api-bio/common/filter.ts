export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string
}

export interface FilterDatasetQuery {
  siteIds: string[]
  startDate: string
  endDate: string
  taxons: string[]
}
