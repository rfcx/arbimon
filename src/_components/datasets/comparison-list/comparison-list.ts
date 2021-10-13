import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { dayjs } from '@/_services/dayjs'
import { datasetColors } from '@/_services/utils'
import { ColoredFilter, Filter } from '..'
import ComparisonFilterModalComponent from '../comparison-filter-modal/comparison-filter-modal.vue'
import { FilterImpl } from '../filter'

const defaultFilter = new FilterImpl(dayjs().subtract(7, 'days'), dayjs(), [])

@Options({
  components: {
    ComparisonFilterModalComponent
  }
})
export default class ComparisonListComponent extends Vue {
  @Emit()
  emitSelect (): ColoredFilter[] {
    return this.filters.map((f, i) => ({
      ...f,
      color: datasetColors[i]
    }))
  }

  selectedFilterId = -1
  isAddSelected = false
  isFilterOpen = false
  filters: FilterImpl[] = [defaultFilter]
  currentSelectedFilter: FilterImpl | null = null

  //  TODO: Have to improve this logic to check what is `all` meaning
  get isDefaultFilter (): boolean {
    return this.filters.length === 1 && this.filters[0].sites.length === 0
  }

  get showAddButton (): boolean {
    return this.filters.length < 5
  }

  mounted (): void {
    this.emitSelect()
  }

  addFilterConfig (): void {
    this.isAddSelected = true
    this.isFilterOpen = true
  }

  getFilterColor (idx: number): string {
    return datasetColors[idx]
  }

  popupOpen (idx: number): void {
    this.isFilterOpen = true
    this.isAddSelected = false
    this.selectedFilterId = idx
    this.currentSelectedFilter = this.filters[this.selectedFilterId]
  }

  popupClose (): void {
    this.isFilterOpen = false
  }

  removeFilterConfig (idx: number): void {
    this.filters.splice(idx, 1)
    if (this.filters.length === 0) {
      this.filters.push(defaultFilter)
    }
    this.emitSelect()
  }

  apply (filter: Filter): void {
    const newFilter = new FilterImpl(filter.startDate, filter.endDate, filter.sites)
    if (this.isAddSelected) {
      this.filters.push(newFilter)
      this.isAddSelected = false
    } else {
      this.filters.splice(this.selectedFilterId, 1, newFilter)
      this.selectedFilterId = -1
    }
    this.emitSelect()
  }
}
