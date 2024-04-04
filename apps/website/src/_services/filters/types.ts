import { type Dayjs } from 'dayjs'

import { type MapableSite } from '@rfcx-bio/common/dao/types'

export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string | number
}

export interface SiteGroup {
  label: string
  value: MapableSite[]
}

// TODO 93 - Remove colors & simplify
export interface ComparisonFilter {
  sites: SiteGroup[]
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: FilterPropertyEquals[]
}

export interface ColoredFilter extends ComparisonFilter {
  color: string
}

// TODO - Move this to common
export interface DatasetParameters {
  sites: MapableSite[]
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: FilterPropertyEquals[] // TODO - Limit this to UI filters; expand it explicitly for the API
}
