import dayjs from 'dayjs'
import { Vue } from 'vue-class-component'

import { SpeciesRichnessFilter, Stream } from '@/models'

const defaultAllStreams: Stream = { id: 'all', name: 'All sites' }
const defaultFilter = new SpeciesRichnessFilter(dayjs().subtract(7, 'days'), dayjs(), [defaultAllStreams])

export default class SpeciesRichnessPage extends Vue {
  public filters: SpeciesRichnessFilter[] = [defaultFilter]

  public addFilterConfig (): void {
    this.filters.push(defaultFilter)
  }

  //  TODO: HAve to improve this logic to check what is `all` meaning
  public get isDefaultFilter (): boolean {
    return this.filters.length === 1 && this.filters[0].streams[0].id === 'all'
  }

  public removeFilterConfig (idx: number): void {
    this.filters.splice(idx, 1)
    if (this.filters.length === 0) {
      this.filters.push(defaultFilter)
    }
  }

  public get showAddButton (): boolean {
    return this.filters.length < 5
  }
}
