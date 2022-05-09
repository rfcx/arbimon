import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { Site, TaxonClass } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { DetectionFilter } from '~/filters'
import { DetectionFilterSiteGroup } from '~/filters/types'
import { BiodiversityStore } from '~/store'
import DateRangePicker from './date-range-picker/date-range-picker.vue'
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
    FilterTaxon
  }
})
export default class ComparisonFilterModalComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: null }) initialValues!: DetectionFilter | null
  @Prop({ default: true }) canFilterByTaxon!: boolean

  @Emit() emitApply (): DetectionFilter {
    this.emitClose()
    return {
      dateStartLocal: dayjs.utc(this.dateStartLocal),
      dateEndLocal: dayjs.utc(this.dateEndLocal),
      siteGroups: this.selectedSiteGroups,
      taxonClasses: this.taxonClasses
    }
  }

  @Emit() emitClose (): boolean { return false }

  // Tabs
  currentActiveMenuId = ''

  // Sites
  inputFilter = ''
  selectedSiteGroups: DetectionFilterSiteGroup[] = []

  // Dates
  readonly today = dayjs().format(DATE_FORMAT)
  dateStartLocal: string | null = dayjs().format(DATE_FORMAT)
  dateEndLocal: string | null = dayjs().format(DATE_FORMAT)
  taxonClasses: TaxonClass[] = []

  get menus (): FilterMenuItem[] {
    return [
      { id: 'sites', name: 'Sites' },
      { id: 'times', name: 'Date Range' },
      ...(this.canFilterByTaxon ? [{ id: 'taxon', name: 'Taxon' }] : [])
    ]
  }

  get isSelectedAllSites (): boolean {
    return this.selectedSiteGroups.length === 0
  }

  get selectedTaxons (): TaxonClass[] {
    return this.taxonClasses
  }

  get optionAllMatchingFilter (): DetectionFilterSiteGroup | undefined {
    return this.inputFilter && this.filtered.length > 0
      ? {
        label: `${this.inputFilter}*`,
        sites: this.filtered
      }
      : undefined
  }

  get filtered (): Site[] {
    if (!this.store.projectData.value.isData) return []

    const prefix = this.inputFilter.toLocaleLowerCase()
    return this.store.projectData.value.data.locationSites
      .filter(site => site.name.toLocaleLowerCase().startsWith(prefix))
  }

  override mounted (): void {
    if (!(this.currentActiveMenuId in this.menus)) this.currentActiveMenuId = this.menus[0].id

    // TODO ?? - What if the list of sites didn't arrive yet?
    this.setDefaultSelectedSites() // TODO ??? - This should clone the sites to avoid mutating it
    if (this.initialValues) {
      this.dateStartLocal = this.initialValues.dateStartLocal?.format(DATE_FORMAT)
      this.dateEndLocal = this.initialValues.dateEndLocal?.format(DATE_FORMAT)
      this.taxonClasses = this.initialValues.taxonClasses
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

  onSiteSelected (item: DetectionFilterSiteGroup): void {
    if (this.selectedSiteGroups.find(sg => sg.label === item.label)) return
    this.selectedSiteGroups.push(item)
  }

  onDateChange (dateRange: [Date, Date]): void {
    this.dateStartLocal = dayjs(dateRange[0]).format(DATE_FORMAT)
    this.dateEndLocal = dayjs(dateRange[1]).format(DATE_FORMAT)
  }

  onRemoveSiteTags (item: DetectionFilterSiteGroup): void {
    const index = this.selectedSiteGroups.findIndex(sg => sg.label === item.label)
    this.selectedSiteGroups.splice(index, 1)
  }

  setDefaultSelectedSites (): void {
    this.selectedSiteGroups = this.initialValues?.siteGroups ?? []
  }

  setActiveMenuId (id: string): void {
    this.currentActiveMenuId = id
  }

  isCurrentActive (id: string): boolean {
    return id === this.currentActiveMenuId
  }

  selectAllSites (): void {
    this.selectedSiteGroups = []
  }

  updateSelectedTaxons (taxonClasses: TaxonClass[]): void {
    this.taxonClasses = taxonClasses
  }
}
