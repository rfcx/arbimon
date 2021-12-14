import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { ComparisonFilter, FilterPropertyEquals } from '~/filters'
import { BiodiversityStore } from '~/store'
import FilterTaxon from './filter-taxon/filter-taxon.vue'

interface FilterMenuItem {
  id: string
  name: string
}

interface SiteCheckbox {
  site: Site
  check: boolean
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
      sites: this.selectedSites,
      startDate: dayjs.utc(this.startDate),
      endDate: dayjs.utc(this.endDate),
      otherFilters: this.otherFilters
    }
  }

  @Emit() emitClose (): boolean { return false }

  currentActiveMenuId = ''
  inputFilter = ''
  isAllMatchedFilteredChecked = false
  selectedSites: Site[] = []
  siteCheckboxItems: SiteCheckbox[] = []
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
    return this.selectedSites.length === 0
  }

  get selectedTaxons (): string[] {
    return this.otherFilters.filter(f => f.propertyName === 'taxon').map(f => f.value)
  }

  get filterInputSites (): SiteCheckbox[] {
      if (!this.inputFilter) {
        this.isAllMatchedFilteredChecked = false
        return this.siteCheckboxItems
      }
      return this.siteCheckboxItems
          .filter(w => w.site.name.toLocaleLowerCase().startsWith(this.inputFilter.toLocaleLowerCase()))
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

  setDefaultSelectedSites (): void {
    this.setDefaultSiteCheckboxItems()
    const selectedSites = this.initialValues?.sites ?? []
    const selectedSiteIds = new Set(selectedSites.map(s => s.siteId))
    this.selectedSites = this.siteCheckboxItems
      .filter(cb => selectedSiteIds.has(cb.site.siteId))
      .map(cb => { cb.check = true; return cb.site })
  }

  setDefaultSiteCheckboxItems (): void {
    this.siteCheckboxItems = [...this.store.sites]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(site => ({ site, check: false }))
  }

  setActiveMenuId (id: string): void {
    this.currentActiveMenuId = id
  }

  isCurrentActive (id: string): boolean {
    return id === this.currentActiveMenuId
  }

  selectAllSites (): void {
    this.selectedSites = []
    this.setDefaultSiteCheckboxItems()
  }

  updateSelectedSites (item: SiteCheckbox): void {
    const siteIdx = this.selectedSites.findIndex(s => s.siteId === item.site.siteId)
    if (siteIdx === -1) {
      this.selectedSites.push(item.site)
      item.check = true
    } else {
      this.selectedSites.splice(siteIdx, 1)
      item.check = false
    }
  }

  updateSelectedTaxons (otherFilters: FilterPropertyEquals[]): void {
    this.otherFilters = otherFilters // TODO ??? - Are you sure this is an overwrite?
  }

  updateSelectedAllFilterSites (): void {
    this.isAllMatchedFilteredChecked = !this.isAllMatchedFilteredChecked
    this.siteCheckboxItems = this.siteCheckboxItems.map(s => {
      if (this.filterInputSites.includes(s)) {
        return {
          ...s,
          check: this.isAllMatchedFilteredChecked
        }
      }
      return { ...s }
    })
    if (this.isAllMatchedFilteredChecked) {
      this.selectedSites = [...this.selectedSites, ...this.filterInputSites.map(f => f.site)]
      return
    }
    const filteredInputSiteIds = this.filterInputSites.map(f => f.site.siteId)
    this.selectedSites = this.selectedSites.filter(s => !filteredInputSiteIds.includes(s.siteId))
  }
}
