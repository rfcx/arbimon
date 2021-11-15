import { Dayjs } from 'dayjs'

import { Filter, Site } from '~/api'

// TODO 93 - Remove colors & simplify
export interface ComparisonFilter {
  sites: Site[]
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: Filter[]
}

export interface ColoredFilter extends Filter {
  color: string
}
