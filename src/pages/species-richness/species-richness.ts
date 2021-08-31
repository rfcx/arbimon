import { Vue } from 'vue-class-component'

import { Stream } from '@/models'

export default class SpeciesRichnessPage extends Vue {
  public streams: Stream[] = [
    {
      name: 'All sites',
      datetime: 'Apr 1 ~ 18, 2021'
    }
  ]

  mounted (): void {
    console.log('Species')
  }

  public addStream (): void {
    this.streams.push(new Stream())
  }

  public get showAddButton (): boolean {
    return this.streams.length < 5
  }
}
