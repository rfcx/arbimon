import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { BiodiversityStore } from '~/store'
import { ColoredFilter, ComparisonFilter } from '..'
import { FilterImpl } from '../classes'
import ComparisonFilterModalComponent from '../comparison-filter-modal/comparison-filter-modal.vue'

const defaultFilter = new FilterImpl(dayjs().subtract(20, 'years').startOf('day'), dayjs().startOf('day'))

@Options({
  components: {
    ComparisonFilterModalComponent
  }
})

export default class ComparisonListComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: true }) canFilterByTaxon!: boolean
  @Emit() emitSelect (): ColoredFilter[] {
    return this.filters.map((f, i) => ({
      ...f,
      color: this.store.datasetColors[i]
    }))
  }

  selectedFilterId = -1
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

  override mounted (): void {
    this.emitSelect()
    if (this.store.projectFilters?.dateStartInclusiveUtc && this.store.projectFilters?.dateEndInclusiveUtc) {
      this.filters = [new FilterImpl(
        dayjs(this.store.projectFilters?.dateStartInclusiveUtc),
        dayjs(this.store.projectFilters?.dateEndInclusiveUtc)
      )]
    }
  }

  addFilterConfig (): void {
    // Copy previous filter
    const previousFilter = this.filters[this.filters.length - 1]
    this.modalFilter = new FilterImpl(
      previousFilter.startDate,
      previousFilter.endDate,
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
