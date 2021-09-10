import dayjs, { Dayjs } from 'dayjs'

import { Stream } from './Stream'

export class SpeciesRichnessFilter {
  startDate: Dayjs= dayjs()
  endDate: Dayjs = dayjs()
  streams: Stream[] = []
  color: string = ''

  constructor (startDate = dayjs(), endDate = dayjs(), streams: Stream[] = [], color = '') {
    this.startDate = startDate
    this.endDate = endDate
    this.streams = streams
    this.color = color
  }

  get displayTitle (): string {
    return this.streams.map(s => s.name).join(', ')
  }

  get displayDate (): string {
    return `${this.startDate.format('MMM D')} - ${this.endDate.format('D, YYYY')}`
  }
}
