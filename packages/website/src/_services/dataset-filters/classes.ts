import { Dayjs } from 'dayjs'

import { Site } from '~/api/types'
import { OptionalFilter } from '~/dataset-filters'
import { formatDateRange } from '../utils/dates'

export class FilterImpl {
  sites: Site[] = []
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: OptionalFilter[] = []
  color: string = ''

  get displayTitle (): string {
    const length = this.sites.length
    if (length === 0) { return 'All sites' }
    return this.sites.map(s => s.name).join(', ')
  }

  get displayDate (): string {
    return formatDateRange(this.startDate, this.endDate)
  }

  constructor (startDate: Dayjs, endDate: Dayjs, sites: Site[] = [], otherFilters: OptionalFilter[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.sites = sites
    this.otherFilters = otherFilters
    this.color = color
  }
}
