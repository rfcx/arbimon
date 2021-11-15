import { Dayjs } from 'dayjs'

import { formatDateRange } from '@rfcx-bio/utils/dates'

import { Filter, Site } from '~/api/types'

export class FilterImpl {
  sites: Site[] = []
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: Filter[] = []
  color: string = ''

  get displayTitle (): string {
    const length = this.sites.length
    if (length === 0) { return 'All sites' }
    return this.sites.map(s => s.name).join(', ')
  }

  get displayDate (): string {
    return formatDateRange(this.startDate, this.endDate)
  }

  constructor (startDate: Dayjs, endDate: Dayjs, sites: Site[] = [], otherFilters: Filter[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.sites = sites
    this.otherFilters = otherFilters
    this.color = color
  }
}
