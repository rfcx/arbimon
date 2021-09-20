import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { SpeciesRichnessFilter, StreamModels } from '@/models'
import ComparisonFilterComponent from '../comparison-filter/comparison-filter.vue'

const defaultAllStreams: StreamModels.Stream = { id: 'all', name: 'All sites' }
const defaultFilter = new SpeciesRichnessFilter(dayjs().subtract(7, 'days'), dayjs(), [defaultAllStreams])

@Options({
  components: {
    ComparisonFilterComponent
  }
})
export default class ComparisonBoxComponent extends Vue {
  public isFilterOpen = false
  public filters: SpeciesRichnessFilter[] = [defaultFilter]

  // TODO: Update add logic
  public addFilterConfig (): void {
    // this.filters.push(defaultFilter)
  }

  //  TODO: Have to improve this logic to check what is `all` meaning
  public get isDefaultFilter (): boolean {
    return this.filters.length === 1 && this.filters[0].streams[0].id === 'all'
  }

  showFilterPopup (open: boolean): void {
    this.isFilterOpen = open
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

  @Emit()
  public select (): SpeciesRichnessFilter[] {
    return this.filters
  }
}
