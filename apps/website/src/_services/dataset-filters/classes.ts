import { Dayjs } from 'dayjs'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { formatDateRange } from '@rfcx-bio/utils/dates'

import { FilterPropertyEquals } from '~/api/types'

export class FilterImpl {
  sites: Site[] = []
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: FilterPropertyEquals[] = []
  color: string = ''

  get displayTitle (): string {
    const length = this.sites.length
    if (length === 0) { return 'All sites' }
    return this.sites.map(s => s.name).join(', ')
  }

  get displayDate (): string {
    return formatDateRange(this.startDate, this.endDate)
  }

  constructor (startDate: Dayjs, endDate: Dayjs, sites: Site[] = [], otherFilters: FilterPropertyEquals[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.sites = sites
    this.otherFilters = otherFilters
    this.color = color
  }
}
