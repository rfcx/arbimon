import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop, Watch } from 'vue-property-decorator'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { storeKey } from '@/globals'
import { type BiodiversityStore } from '~/store'
import { type ColoredFilter, type ComparisonFilter } from '..'
import { FilterImpl } from '../classes'
import ComparisonFilterModalComponent from '../comparison-filter-modal/comparison-filter-modal.vue'

const DEFAULT_START = dayjs.utc('1990-01-01T00:00:00.000Z').startOf('day')
const DEFAULT_END = dayjs().utc().startOf('day')
const defaultFilter = new FilterImpl(DEFAULT_START, DEFAULT_END)

@Options({
  components: {
    ComparisonFilterModalComponent
  }
})

export default class ComparisonListComponent extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop({ default: true }) canFilterByTaxon!: boolean
  @Prop() dateStart!: string | undefined
  @Prop() dateEnd!: string | undefined

  @Emit() emitSelect (): ColoredFilter[] {
    return this.filters.map((f, i) => ({
      ...f,
      color: this.store.datasetColors[i]
    }))
  }

  selectedFilterId = -1
  selectedDateStart = this.dateStart ?? ''
  selectedDateEnd = this.dateEnd ?? ''
  isAddSelected = false
  isFilterOpen = false
  filters: FilterImpl[] = [defaultFilter]
  modalFilter: FilterImpl | null = null

  //  TODO: Have to improve this logic to check what is `all` meaning
  get isDefaultFilter (): boolean {
    return this.filters.length === 1 && this.filters[0].sites.length === 0
  }

  get showAddButton (): boolean {
    return this.filters.length < 5
  }

  // Trigger when project change
  @Watch('store.projectFilters', { deep: true, immediate: true })
  onProjectFilterChange (): void {
    const startDate = this.selectedDateStart ? dayjs.utc(this.selectedDateStart) : this.store.projectFilters?.dateStartInclusiveUtc ? dayjs.utc(this.store.projectFilters?.dateStartInclusiveUtc).startOf('day') : DEFAULT_START
    const endDate = this.selectedDateEnd ? dayjs.utc(this.selectedDateEnd) : this.store.projectFilters?.dateEndInclusiveUtc ? dayjs.utc(this.store.projectFilters?.dateEndInclusiveUtc).startOf('day') : DEFAULT_END
    this.filters = [new FilterImpl(
      startDate,
      endDate
    )]
    if (this.store.projectFilters === undefined) return
    this.emitSelect()
  }

  addFilterConfig (): void {
    // Copy previous filter if there are not date range selection in the router
    const previousFilter = this.filters[this.filters.length - 1]
    this.modalFilter = new FilterImpl(
      this.selectedDateStart ? dayjs(this.selectedDateStart) : previousFilter.startDate,
      this.selectedDateEnd ? dayjs(this.selectedDateEnd) : previousFilter.endDate,
      previousFilter.sites.map(s => ({ ...s })),
      previousFilter.otherFilters.map(f => ({ ...f })),
      previousFilter.color
    )
    // Open modal
    this.isAddSelected = true
    this.isFilterOpen = true
  }

  getFilterColor (idx: number): string {
    return this.store.datasetColors[idx]
  }

  getOptionalFilterText (idx: number): string {
    const otherFilters = this.filters[idx].otherFilters
    if (otherFilters.length === 0) return 'All taxon'
    if (otherFilters.length === 1) return `${otherFilters[0].propertyName}: ${this.store.projectFilters?.taxonClasses?.find(tc => tc.id === otherFilters[0].value)?.commonName ?? ''}`
    return `+ ${otherFilters.length} filter${otherFilters.length > 1 ? 's' : ''} applied`

    // TODO: 268 Show full information of filter when the user hovers over the comparison box
    /*
    const optionalFilters = groupBy(this.filters[idx].otherFilters, 'title')
    const getFilterValue = (filters: OptionalFilter[]): string => filters.map(f => f.value).join(', ')
    const groupedOptionalFilters = mapValues(optionalFilters, getFilterValue) // type ==> { [x: string]: string } ==> e.g. {'taxon': 'frog, bird'}
    return groupedOptionalFilters // TODO: expect to transform this { [x: string]: string } to string ==> e.g. "Taxon: frog, bird"
    */
  }

  popupOpen (idx: number): void {
    this.isFilterOpen = true
    this.isAddSelected = false
    this.selectedFilterId = idx
    this.modalFilter = this.filters[this.selectedFilterId]
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

  apply (filter: ComparisonFilter): void {
    const newFilter = new FilterImpl(filter.startDate, filter.endDate, filter.sites, filter.otherFilters)
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
