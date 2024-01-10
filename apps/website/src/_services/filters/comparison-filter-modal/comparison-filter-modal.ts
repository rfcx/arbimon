import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { type Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { storeKey } from '@/globals'
import { type ComparisonFilter, type FilterPropertyEquals, type SiteGroup } from '~/filters'
import { type BiodiversityStore } from '~/store'
import DateRangePicker from './date-range-picker/date-range-picker.vue'
import FilterSite from './filter-site/filter-site.vue'
import FilterTaxon from './filter-taxon/filter-taxon.vue'

interface FilterMenuItem {
  id: string
  name: string
}

const DATE_FORMAT = 'YYYY-MM-DD'

@Options({
  components: {
    OnClickOutside,
    DateRangePicker,
    FilterSite,
    FilterTaxon
  }
})
export default class ComparisonFilterModalComponent extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop({ default: null }) initialValues!: ComparisonFilter | null
  @Prop({ default: true }) canFilterByTaxon!: boolean

  @Emit() emitApply (): ComparisonFilter {
    this.emitClose()
    return {
      sites: this.selectedSiteGroups,
      startDate: dayjs.utc(this.startDate),
      endDate: dayjs.utc(this.endDate),
      otherFilters: this.otherFilters
    }
  }

  @Emit() emitClose (): boolean { return false }

  // Tabs
  currentActiveMenuId = ''

  // Sites
  inputFilter = ''
  selectedSiteGroups: SiteGroup[] = []

  // Dates
  readonly today = dayjs().format(DATE_FORMAT)
  startDate: string | null = dayjs().format(DATE_FORMAT)
  endDate: string | null = dayjs().format(DATE_FORMAT)

  // Other filters
  otherFilters: FilterPropertyEquals[] = []

  get menus (): FilterMenuItem[] {
    return [
      { id: 'sites', name: 'Sites' },
      { id: 'times', name: 'Date Range' },
      ...(this.canFilterByTaxon ? [{ id: 'taxon', name: 'Taxon' }] : [])
    ]
  }

  get selectedTaxons (): number[] {
    return this.otherFilters.filter(f => f.propertyName === 'taxon').map(f => f.value) as number[]
  }

  get optionAllMatchingFilter (): SiteGroup | undefined {
    return this.inputFilter && this.filtered.length > 0
      ? {
        label: `${this.inputFilter}*`,
        value: this.filtered
      }
      : undefined
  }

  get filtered (): Site[] {
    const prefix = this.inputFilter.toLocaleLowerCase()
    return (this.store.projectFilters?.locationSites ?? [])
      .filter(site => site.name.toLocaleLowerCase().startsWith(prefix))
  }

  override mounted (): void {
    if (!(this.currentActiveMenuId in this.menus)) this.currentActiveMenuId = this.menus[0].id

    // TODO ?? - What if the list of sites didn't arrive yet?
    this.setDefaultSelectedSites() // TODO ??? - This should clone the sites to avoid mutating it
    if (this.initialValues) {
      this.startDate = this.initialValues.startDate?.format(DATE_FORMAT)
      this.endDate = this.initialValues.endDate?.format(DATE_FORMAT)
      this.otherFilters = this.initialValues.otherFilters.map(f => ({ ...f }))
    }
  }

  onSetSelectorPlaceHolder (): void {
    const inputEl = document.querySelector('[name="input-site"]') as HTMLInputElement
    const searchSelector = document.querySelector('.search-select')
    const getClass = searchSelector?.querySelector('.el-input--suffix')
    const isFocusSiteSelector = getClass?.classList.contains('is-focus') ?? false

    if (isFocusSiteSelector ?? false) {
      inputEl.removeAttribute('placeholder')
      inputEl.setAttribute('placeholder', 'Type to filter sites')
    }
  }

  onRemoveSelectorPlaceHolder (): void {
    const inputEl = document.querySelector('[name="input-site"]') as HTMLInputElement
    inputEl.removeAttribute('placeholder')
  }

  onFilterType (query: string): void {
    this.inputFilter = query
  }

  onDateChange (dateRange: [Date, Date]): void {
    this.startDate = dayjs(dateRange[0]).format(DATE_FORMAT)
    this.endDate = dayjs(dateRange[1]).format(DATE_FORMAT)
  }

  setDefaultSelectedSites (): void {
    this.selectedSiteGroups = this.initialValues?.sites ?? []
  }

  setActiveMenuId (id: string): void {
    this.currentActiveMenuId = id
  }

  isCurrentActive (id: string): boolean {
    return id === this.currentActiveMenuId
  }

  updateSelectedTaxons (otherFilters: FilterPropertyEquals[]): void {
    this.otherFilters = otherFilters // TODO ??? - Are you sure this is an overwrite?
  }

  updateSelectedSites (selectedSiteGroups: SiteGroup[]): void {
    this.selectedSiteGroups = selectedSiteGroups
  }
}
