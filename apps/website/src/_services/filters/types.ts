import { Dayjs } from 'dayjs'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'

export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string
}

// TODO 93 - Remove colors & simplify
export interface ComparisonFilter {
  sites: Site[]
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: FilterPropertyEquals[]
}

export interface ColoredFilter extends ComparisonFilter {
  color: string
}

// TODO - Move this to common
export interface DatasetParameters {
  sites: Site[]
  start: string
  end: string
  otherFilters: FilterPropertyEquals[] // TODO - Limit this to UI filters; expand it explicitly for the API
}
