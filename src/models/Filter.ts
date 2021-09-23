import { Dayjs } from 'dayjs'

import { formatDateRange } from '@/utils'
import { Stream } from './Stream'

export interface FilterBase {
  streams: Stream[]
  startDate: Dayjs
  endDate: Dayjs
}

export class SpeciesRichnessFilter {
  startDate: Dayjs
  endDate: Dayjs
  streams: Stream[] = []
  color: string = ''

  constructor (startDate: Dayjs, endDate: Dayjs, streams: Stream[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.streams = streams
    this.color = color
  }

  get displayTitle (): string {
    const length = this.streams.length
    if (length === 0) { return 'All sites' }
    return this.streams.map(s => s.name).join(', ')
  }

  get displayDate (): string {
    return formatDateRange(this.startDate, this.endDate)
  }
}
