import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { Site } from '~/api/types'
import { BiodiversityStore } from '~/store'
import { Filter } from '..'

interface FilterMenuItem {
  id: string
  name: string
}

interface SiteCheckbox {
  site: Site
  check: boolean
}

const DATE_FORMAT = 'YYYY-MM-DD'

const menus: FilterMenuItem[] = [
  { id: 'sites', name: 'Sites' },
  { id: 'times', name: 'Date Range' }
]

@Options({
  components: {
    OnClickOutside
  }
})
export default class ComparisonFilterModalComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: null }) defaultFilter!: Filter | null

  @Emit() emitApply (): Filter {
    this.emitClose()
    return {
      sites: this.selectedSites,
      startDate: dayjs.utc(this.startDate),
      endDate: dayjs.utc(this.endDate)
    }
  }

  @Emit() emitClose (): boolean { return false }

  menus = menus
  currentActiveMenuId = menus[0].id

  selectedSites: Site[] = []
  siteCheckboxItems: SiteCheckbox[] = []
  readonly today = dayjs().format(DATE_FORMAT)
  startDate: string | null = dayjs().format(DATE_FORMAT)
  endDate: string | null = dayjs().format(DATE_FORMAT)

  get isSelectedAllSites (): boolean {
    return this.selectedSites.length === 0
  }

  override mounted (): void {
    // TODO ?? - What if the list of sites didn't arrive yet?
    this.setDefaultSelectedSites()
    if (this.defaultFilter) {
      this.startDate = this.defaultFilter.startDate?.format(DATE_FORMAT)
      this.endDate = this.defaultFilter.endDate?.format(DATE_FORMAT)
    }
  }

  setDefaultSelectedSites (): void {
    this.setDefaultSiteCheckboxItems()
    const selectedSites = this.defaultFilter?.sites ?? []
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
}
