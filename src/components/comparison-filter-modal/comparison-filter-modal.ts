import { OnClickOutside } from '@vueuse/components'
import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { FilterBase, SiteModels, SpeciesRichnessFilter } from '@/models'
import { SiteService } from '@/services'

interface FilterMenuItem {
  id: string
  name: string
}

interface SiteCheckbox {
  site: SiteModels.Site
  check: boolean
}

const dateFormat = 'YYYY-MM-DD'

@Options({
  components: {
    OnClickOutside
  }
})
export default class ComparisonFilterModalComponent extends Vue {
  @Prop({ default: null }) defaultFilter!: SpeciesRichnessFilter | null

  @Emit()
  emitApply (): FilterBase {
    this.emitClose()
    return {
      sites: this.selectedSites,
      startDate: dayjs.utc(this.startDate),
      endDate: dayjs.utc(this.endDate)
    }
  }

  @Emit()
  emitClose (): boolean {
    return false
  }

  selectedSites: SiteModels.Site[] = []
  siteCheckboxItems: SiteCheckbox[] = []
  startDate: string | null = dayjs().subtract(7, 'days').format(dateFormat)
  endDate: string | null = dayjs().format(dateFormat)
  readonly today = dayjs().format(dateFormat)
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

  get allSites (): SiteModels.Site[] {
    return SiteService.getSites()
  }

  get isSelectedAllSites (): boolean {
    return this.selectedSites.length === 0
  }

  mounted (): void {
    this.setDefaultSelectedSites()
    if (this.defaultFilter) {
      this.startDate = this.defaultFilter.startDate?.format(dateFormat)
      this.endDate = this.defaultFilter.endDate?.format(dateFormat)
    }
  }

  setDefaultSelectedSites (): void {
    this.setDefaultSiteCheckboxItems()
    const selectedSites = this.defaultFilter?.sites ?? []
    const selectedSiteIds = new Set(selectedSites.map(s => s.id))
    this.selectedSites = this.siteCheckboxItems
      .filter(cb => selectedSiteIds.has(cb.site.id))
      .map(cb => { cb.check = true; return cb.site })
  }

  setDefaultSiteCheckboxItems (): void {
    this.siteCheckboxItems = this.allSites
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
    const siteIdx = this.selectedSites.findIndex(s => s.id === item.site.id)
    if (siteIdx === -1) {
      this.selectedSites.push(item.site)
      item.check = true
    } else {
      this.selectedSites.splice(siteIdx, 1)
      item.check = false
    }
  }
}
