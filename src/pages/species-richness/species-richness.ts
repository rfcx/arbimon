import { Vue } from 'vue-class-component'

import { Stream } from '@/models'

const defaultFilter: Stream = {
  value: 'all',
  name: 'All sites',
  datetime: 'All time'
}

export default class SpeciesRichnessPage extends Vue {
  public streams: Stream[] = [defaultFilter]

  public addFilterConfig (): void {
    this.streams.push(new Stream())
  }

  public get isDefaultFilter (): boolean {
    return this.streams.length === 1 && this.streams[0].value === 'all'
  }

  public removeFilterConfig (idx: number): void {
    console.log(idx)
    this.streams.splice(idx, 1)
    if (this.streams.length === 0) {
      this.streams.push(defaultFilter)
    }
  }

  public get showAddButton (): boolean {
    return this.streams.length < 5
  }
}
