import { Site } from '../../api-bio/common/sites'

export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string
}

export interface FilterDatasetQuery {
  siteIds: Array<Site['siteId']>
  startDate: string
  endDate: string
  taxons: string[]
}
