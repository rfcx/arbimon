import { type Dayjs } from 'dayjs'

import { formatDateRange } from '@rfcx-bio/utils/dates'

import { type SiteGroup } from '~/filters'
import { type ComparisonFilter, type FilterPropertyEquals } from './types'

export class FilterImpl implements ComparisonFilter {
  sites: SiteGroup[] = []
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: FilterPropertyEquals[] = []
  color: string = ''

  get displayTitle (): string {
    const length = this.sites.length
    if (length === 0) { return 'All sites' }
    return this.sites.map(s => s.label).join(', ')
  }

  get displayDate (): string {
    return formatDateRange(this.startDate, this.endDate)
  }

  constructor (startDate: Dayjs, endDate: Dayjs, sites: SiteGroup[] = [], otherFilters: FilterPropertyEquals[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.sites = sites
    this.otherFilters = otherFilters
    this.color = color
  }
}
