import { Dayjs } from 'dayjs'

import { Stream } from './Stream'

export interface FilterBase {
  streams: Stream[]
  startDate: Dayjs | null
  endDate: Dayjs | null
}

export class SpeciesRichnessFilter {
  startDate: Dayjs | null = null
  endDate: Dayjs | null = null
  streams: Stream[] = []
  color: string = ''

  constructor (startDate: Dayjs | null, endDate: Dayjs | null, streams: Stream[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.streams = streams
    this.color = color
  }

  get displayTitle (): string {
    return this.streams.map(s => s.name).join(', ')
  }

  get displayDate (): string {
    const start = this.startDate ? `${this.startDate.format('MMM D')} - ` : ''
    const end = this.endDate ? this.endDate.format('D, YYYY') : ''
    return `${start}${end}`
  }
}
