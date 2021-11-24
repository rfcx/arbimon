import { Dayjs } from 'dayjs'

import { FilterPropertyEquals, Site } from '~/api'

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
