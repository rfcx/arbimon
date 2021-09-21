import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { FilterBase, SpeciesRichnessFilter, StreamModels } from '@/models'
import ComparisonFilterComponent from '../comparison-filter/comparison-filter.vue'

const defaultAllStreams: StreamModels.Stream = { id: 'all', name: 'All sites' }
const defaultFilter = new SpeciesRichnessFilter(dayjs().subtract(7, 'days'), dayjs(), [defaultAllStreams])

@Options({
  components: {
    ComparisonFilterComponent
  }
})
export default class ComparisonBoxComponent extends Vue {
  public selectedFilterId = -1
  public isAddSelected = false
  public isFilterOpen = false
  public filters: SpeciesRichnessFilter[] = [defaultFilter]
  public currentSelectedFilter: SpeciesRichnessFilter | null = null

  public addFilterConfig (): void {
    this.isAddSelected = true
    this.showFilterPopup(true)
  }

  //  TODO: Have to improve this logic to check what is `all` meaning
  public get isDefaultFilter (): boolean {
    return this.filters.length === 1 && this.filters[0].streams[0].id === 'all'
  }

  showFilterPopup (open: boolean, idx?: number): void {
    this.isFilterOpen = open
    this.selectedFilterId = idx ?? -1
    this.currentSelectedFilter = this.selectedFilterId !== -1 ? this.filters[this.selectedFilterId] : null
  }

  public removeFilterConfig (idx: number): void {
    this.filters.splice(idx, 1)
    if (this.filters.length === 0) {
      this.filters.push(defaultFilter)
    }
  }

  public apply (filter: FilterBase): void {
    const newFilter = new SpeciesRichnessFilter(filter.startDate, filter.endDate, filter.streams)
    if (this.isAddSelected) {
      this.filters.push(newFilter)
      this.isAddSelected = false
    } else {
      this.filters.splice(this.selectedFilterId, 1, newFilter)
    }
    this.select()
  }

  public get showAddButton (): boolean {
    return this.filters.length < 5
  }

  @Emit()
  public select (): SpeciesRichnessFilter[] {
    return this.filters
  }
}
