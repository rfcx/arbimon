import { Dayjs } from 'dayjs'

import { formatDateRange } from '@/utils'
import { Site } from './Site'

export interface FilterBase {
  sites: Site[]
  startDate: Dayjs
  endDate: Dayjs
}

export class SpeciesRichnessFilter {
  startDate: Dayjs
  endDate: Dayjs
  sites: Site[] = []
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
