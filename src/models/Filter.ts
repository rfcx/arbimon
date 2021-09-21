import { Dayjs } from 'dayjs'

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
    if (this.streams.length === 0) { return 'All Sites' }
    return this.streams.map(s => s.name).join(', ')
  }

  // TODO [12]: date format when start and end date are not in the same month/year
  get displayDate (): string {
    return `${this.startDate.format('MMM D')} - ${this.endDate.format('D, YYYY')}`
  }
}
