import { type Dayjs } from 'dayjs'
import { isArray, isEmpty } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop, Watch } from 'vue-property-decorator'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { storeKey } from '@/globals'
import { type BiodiversityStore } from '~/store'
import { type ColoredFilter, type ComparisonFilter, type FilterPropertyEquals, type SiteGroup } from '..'
import { FilterImpl } from '../classes'
import ComparisonFilterModalComponent from '../comparison-filter-modal/comparison-filter-modal.vue'

const DEFAULT_START = dayjs.utc('1990-01-01T00:00:00.000Z').startOf('day')
const DEFAULT_END = dayjs().utc().startOf('day')
const defaultFilter = new FilterImpl(DEFAULT_START, DEFAULT_END)

const DATE_FORMAT = 'YYYY-MM-DD'

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

  get getDefaultProjectDate (): [Dayjs, Dayjs] {
    return [
      this.store.projectFilters?.dateStartInclusiveUtc ? dayjs.utc(this.store.projectFilters?.dateStartInclusiveUtc).startOf('day') : DEFAULT_START,
      this.store.projectFilters?.dateEndInclusiveUtc ? dayjs.utc(this.store.projectFilters?.dateEndInclusiveUtc).startOf('day') : DEFAULT_END
    ]
  }

  // Trigger when project change
  @Watch('store.projectFilters', { deep: true, immediate: true })
  onProjectFilterChange (): void {
    this.filters = this.extractFilters()
    if (this.store.projectFilters === undefined) return
    this.fillQueryFromComparison()
    this.emitSelect()
  }

  extractFilters (): FilterImpl[] {
    const query = this.$route.query
    if (isEmpty(query.dss)) {
      return [new FilterImpl(this.getDefaultProjectDate[0], this.getDefaultProjectDate[1])]
    }
    const numberOfDatasets = Number(query.dss)
    const results: FilterImpl[] = []
    for (let i = 0; i < numberOfDatasets; i++) {
      const datasetPrefix = String.fromCharCode(97 + i)
      const queryStartDate = (query[`${datasetPrefix}b`] as string | null) ?? this.getDefaultProjectDate[0]
      const queryEndDate = query[`${datasetPrefix}e`] as string | null ?? this.getDefaultProjectDate[1]
      const querySites = query[`${datasetPrefix}s`] as string[] | undefined
      const queryTaxons = query[`${datasetPrefix}t`] as string | string[] | undefined
      const startDate = dayjs.utc(queryStartDate).startOf('day')
      const endDate = dayjs.utc(queryEndDate).startOf('day')

      const sites = this.filterSiteGroup(querySites)
      const taxons = this.filteredTaxons(queryTaxons)
      results.push(new FilterImpl(startDate, endDate, sites, taxons))
    }
    return results
  }

  filteredTaxons (queryTaxons: string[] | string | undefined): FilterPropertyEquals[] | undefined {
    if (queryTaxons === undefined) return undefined
    let taxons: number[]
    if (!isArray(queryTaxons)) taxons = [Number(queryTaxons)]
    else taxons = queryTaxons.map(taxon => Number(taxon))
    return (this.store.projectFilters?.taxonClasses ?? [])
      .filter(taxon => taxons.includes(taxon.id)).map(item => { return { propertyName: 'taxon', value: item.id } })
  }

  filterSiteGroup (querySites: string[] | string | undefined): SiteGroup[] | undefined {
    if (querySites === undefined) return undefined
    const siteGroup: SiteGroup[] = []
    if (!isArray(querySites)) querySites = [querySites]
    const existingIds: number[] = []
    querySites.forEach((label: string) => {
      if (Number(label)) {
        const [site] = (this.store.projectFilters?.locationSites ?? []).filter(site => site.id === Number(label))
        siteGroup.push({ label: site.name, value: [site] })
        existingIds.push(site.id)
      } else {
        const prefix = label.toLocaleLowerCase().substring(0, label.length - 1)
        const sites = (this.store.projectFilters?.locationSites ?? []).filter(site => site.name.toLocaleLowerCase().startsWith(prefix) && !existingIds.includes(site.id))
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
    this.fillQueryFromComparison()
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
    this.fillQueryFromComparison()
    this.emitSelect()
  }

  fillQueryFromComparison (): void {
    if (this.filters.length === 0) {
      void this.$router.replace({ query: undefined })
    } else {
      const prefixes: string[] = ['a', 'b', 'c', 'd', 'e']
      const query: any = {
        dss: this.filters.length
      }
      this.filters.forEach((filter: FilterImpl, ind: number) => {
        const startDate = prefixes[ind] + 'b'
        const endDate = prefixes[ind] + 'e'
        const sites = prefixes[ind] + 's'
        const taxons = prefixes[ind] + 't'
        query[startDate] = dayjs(filter.startDate).format(DATE_FORMAT)
        query[endDate] = dayjs(filter.endDate).format(DATE_FORMAT)
        query[sites] = this.getSelectedSiteIdsAndLabels(filter.sites)
        const selectedTaxons = filter.otherFilters.filter(f => f.propertyName === 'taxon').map(f => f.value) as number[]
        query[taxons] = selectedTaxons
      })
      void this.$router.replace({ query: { ...query } })
    }
  }

  getSelectedSiteIdsAndLabels (selectedSiteGroups: SiteGroup[]): string[] {
    const siteIds: string[] = []
    selectedSiteGroups.forEach((group: SiteGroup) => {
      if (group.value.length > 1) {
        siteIds.push(group.label)
      } else group.value.forEach(site => siteIds.push(site.id.toString()))
    })
    return siteIds
  }
}
