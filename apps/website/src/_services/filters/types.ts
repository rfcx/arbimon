import { type Dayjs } from 'dayjs'

import { type Site } from '@rfcx-bio/common/dao/types'

export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string | number
}

export interface UrlQueryType {
  dss: number
  ab?: string
  ae?: string
  as?: string[]
  at?: number[]
  bb?: string
  be?: string
  bs?: string[]
  bt?: number[]
  cb?: string
  ce?: string
  cs?: string[]
  ct?: number[]
  eb?: string
  ee?: string
  es?: string[]
  et?: number[]
  db?: string
  de?: string
  ds?: string[]
  dt?: number[]
}

export interface SiteGroup {
  label: string
  value: Site[]
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
  sites: Site[]
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: FilterPropertyEquals[] // TODO - Limit this to UI filters; expand it explicitly for the API
}
