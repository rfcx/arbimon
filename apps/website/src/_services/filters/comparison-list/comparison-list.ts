import { isArray } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop, Watch } from 'vue-property-decorator'

// import { type Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { storeKey } from '@/globals'
import { type BiodiversityStore } from '~/store'
import { type ColoredFilter, type ComparisonFilter, type FilterPropertyEquals, type SiteGroup } from '..'
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

  @Emit() emitSelect (): ColoredFilter[] {
    return this.filters.map((f, i) => ({
      ...f,
      color: this.store.datasetColors[i]
    }))
  }

  selectedFilterId = -1
  selectedDateStart: string = ''
  selectedDateEnd: string = ''
  selectedSiteIds: string[] = []
  selectedTaxonIds: number[] = []
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

  get filteredTaxons (): FilterPropertyEquals[] {
    return (this.store.projectFilters?.taxonClasses ?? [])
      .filter(taxon => this.selectedTaxonIds.includes(taxon.id)).map(item => { return { propertyName: 'taxon', value: item.id } })
  }

  // Trigger when project change
  @Watch('store.projectFilters', { deep: true, immediate: true })
  onProjectFilterChange (): void {
    // Parse query url
    const routerSites = this.$route.query.sites
    const routerTaxons = this.$route.query.taxons
    const isMultipleSites = isArray(routerSites)
    const isMultipleTaxons = isArray(routerTaxons)
    this.selectedSiteIds = isMultipleSites ? routerSites as string[] : [routerSites as string]
    this.selectedTaxonIds = isMultipleTaxons ? (routerTaxons as string[]).map(item => Number(item)) : [Number(routerTaxons)]
    this.selectedDateStart = this.$route.query.startDate as string
    this.selectedDateEnd = this.$route.query.endDate as string
    // Get filter data
    const startDate = this.selectedDateStart ? dayjs.utc(this.selectedDateStart) : this.store.projectFilters?.dateStartInclusiveUtc ? dayjs.utc(this.store.projectFilters?.dateStartInclusiveUtc).startOf('day') : DEFAULT_START
    const endDate = this.selectedDateEnd ? dayjs.utc(this.selectedDateEnd) : this.store.projectFilters?.dateEndInclusiveUtc ? dayjs.utc(this.store.projectFilters?.dateEndInclusiveUtc).startOf('day') : DEFAULT_END
    const taxons = this.filteredTaxons
    this.filters = [new FilterImpl(
      startDate,
      endDate,
      this.filterSiteGroup(),
      taxons
    )]
    if (this.store.projectFilters === undefined) return
    this.emitSelect()
  }

  filterSiteGroup (): SiteGroup[] {
    const siteGroup: SiteGroup[] = []
    const existingIds: number[] = []
    this.selectedSiteIds.forEach((label: string) => {
      console.info(existingIds)
      if (Number(label)) {
        const [site] = (this.store.projectFilters?.locationSites ?? [])
        .filter(site => site.id === Number(label))
        siteGroup.push({ label: site.name, value: [site] })
        existingIds.push(site.id)
      } else {
        const prefix = label.toLocaleLowerCase().substring(0, label.length - 1)
        const sites = (this.store.projectFilters?.locationSites ?? [])
          .filter(site => site.name.toLocaleLowerCase().startsWith(prefix) && !existingIds.includes(site.id))
        console.info(sites, this.store.projectFilters?.locationSites)
        siteGroup.push({ label, value: sites })
      }
    })
    return siteGroup
  }

  addFilterConfig (): void {
    // Copy previous filter if there are not date range selection in the router
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
