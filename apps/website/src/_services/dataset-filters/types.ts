import { Dayjs } from 'dayjs'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'

import { FilterPropertyEquals } from '~/api'

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
