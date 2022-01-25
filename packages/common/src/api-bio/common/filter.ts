export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string
}

export interface FilterDatasetQuery {
  startDate: string
  endDate: string
  siteIds: string[] | string // empty arrays get serialized as ''
  taxons: string[] | string // empty arrays get serialized as ''
}
