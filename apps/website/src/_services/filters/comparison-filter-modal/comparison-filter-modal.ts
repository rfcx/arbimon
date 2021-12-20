import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { ComparisonFilter, FilterPropertyEquals, SiteGroup } from '~/filters'
import { BiodiversityStore } from '~/store'
import FilterTaxon from './filter-taxon/filter-taxon.vue'

interface FilterMenuItem {
  id: string
  name: string
}

const DATE_FORMAT = 'YYYY-MM-DD'

@Options({
  components: {
    OnClickOutside,
    FilterTaxon
  }
})
export default class ComparisonFilterModalComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: null }) initialValues!: ComparisonFilter | null
  @Prop({ default: true }) canFilterByTaxon!: boolean

  @Emit() emitApply (): ComparisonFilter {
    this.emitClose()
    return {
      sites: this.tempSelectedSites,
      startDate: dayjs.utc(this.startDate),
      endDate: dayjs.utc(this.endDate),
      otherFilters: this.otherFilters
    }
  }

  @Emit() emitClose (): boolean { return false }

  currentActiveMenuId = ''
  inputFilter = ''
  isAllMatchedFilteredChecked = false
  tempSelectedSites: SiteGroup[] = []
  readonly today = dayjs().format(DATE_FORMAT)
  startDate: string | null = dayjs().format(DATE_FORMAT)
  endDate: string | null = dayjs().format(DATE_FORMAT)
  otherFilters: FilterPropertyEquals[] = []

  get menus (): FilterMenuItem[] {
    return [
      { id: 'sites', name: 'Sites' },
      { id: 'times', name: 'Date Range' },
      ...(this.canFilterByTaxon ? [{ id: 'taxon', name: 'Taxon' }] : [])
    ]
  }

  get isSelectedAllSites (): boolean {
    return this.tempSelectedSites.length === 0
  }

  get selectedTaxons (): string[] {
    return this.otherFilters.filter(f => f.propertyName === 'taxon').map(f => f.value)
  }

  get allMatchOption (): SiteGroup | undefined {
    return this.inputFilter
      ? {
        label: `${this.inputFilter.toLocaleUpperCase()}*`,
        value: this.filtered
      }
      : undefined
  }

  get filtered (): Site[] {
    const prefix = this.inputFilter.toLocaleLowerCase()
    return this.store.sites
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

  onFilterType (query: string): void {
    this.inputFilter = query
    console.log('tempSelectedSites', this.tempSelectedSites)
  }

  onRemoveSiteTags (item: SiteGroup): void {
    const index = this.tempSelectedSites.findIndex(sg => sg.label === item.label)
    this.tempSelectedSites.splice(index, 1)
  }

  setDefaultSelectedSites (): void {
    this.tempSelectedSites = this.initialValues?.sites ?? []
  }

  setActiveMenuId (id: string): void {
    this.currentActiveMenuId = id
  }

  isCurrentActive (id: string): boolean {
    return id === this.currentActiveMenuId
  }

  selectAllSites (): void {
    this.tempSelectedSites = []
  }

  updateSelectedTaxons (otherFilters: FilterPropertyEquals[]): void {
    this.otherFilters = otherFilters // TODO ??? - Are you sure this is an overwrite?
  }
}
