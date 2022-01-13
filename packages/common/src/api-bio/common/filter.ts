import { Dayjs } from 'dayjs'

import { Site } from '../../api-bio/common/sites'

export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string
}

// For API internal use
export interface FilterDataset {
  siteIds: Array<Site['siteId']>
  startDate: Dayjs
  endDate: Dayjs
  taxons: string[]
}

// For API query use
export interface FilterDatasetQuery {
  siteIds: Array<Site['siteId']>
  startDate: string
  endDate: string
  taxons: string[]
}
