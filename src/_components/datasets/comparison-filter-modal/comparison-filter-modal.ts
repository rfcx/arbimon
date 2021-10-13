import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { Site } from '@/_services/api/types'
import { dayjs } from '@/_services/dayjs'
import { VuexProject } from '@/_services/stores/vuex-service'
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

@Options({
  components: {
    OnClickOutside
  }
})
export default class ComparisonFilterModalComponent extends Vue {
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

  @VuexProject.sites.bind()
  allSites!: Site[]

  selectedSites: Site[] = []
  siteCheckboxItems: SiteCheckbox[] = []
  startDate: string | null = dayjs().subtract(7, 'days').format(DATE_FORMAT)
  endDate: string | null = dayjs().format(DATE_FORMAT)
  readonly today = dayjs().format(DATE_FORMAT)
  currentActiveMenuId = 'sites'

  get menus (): FilterMenuItem[] {
    return [
      {
        id: 'sites',
        name: 'Sites'
      },
      {
        id: 'times',
        name: 'Time Range'
      }
    ]
  }

  get isSelectedAllSites (): boolean {
    return this.selectedSites.length === 0
  }

  mounted (): void {
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
    this.siteCheckboxItems = [...this.allSites]
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
