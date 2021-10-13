import { Dayjs } from 'dayjs'

import { Site } from '@/_services/api/types'
import { formatDateRange } from '@/_services/utils'

export class FilterImpl {
  sites: Site[] = []
  startDate: Dayjs
  endDate: Dayjs
  color: string = ''

  get displayTitle (): string {
    const length = this.sites.length
    if (length === 0) { return 'All sites' }
    return this.sites.map(s => s.name).join(', ')
  }

  get displayDate (): string {
    return formatDateRange(this.startDate, this.endDate)
  }

  constructor (startDate: Dayjs, endDate: Dayjs, sites: Site[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.sites = sites
    this.color = color
  }
}
