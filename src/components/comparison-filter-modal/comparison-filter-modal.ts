import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

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
  @Prop({ default: null })
  defaultFilter!: SpeciesRichnessFilter | null

  public selectedSites: SiteModels.Site[] = []
  public siteCheckboxItems: SiteCheckbox[] = []
  public startDate: string | null = dayjs().subtract(7, 'days').format(dateFormat)
  public endDate: string | null = dayjs().format(dateFormat)
  public readonly today = dayjs().format(dateFormat)
  public currentActiveMenuId = 'sites'

  public mounted (): void {
    this.setDefaultSelectedSites()
    if (this.defaultFilter) {
      this.startDate = this.defaultFilter.startDate?.format(dateFormat)
      this.endDate = this.defaultFilter.endDate?.format(dateFormat)
    }
  }

  public setDefaultSelectedSites (): void {
    this.setDefaultSiteCheckboxItems()
    const selectedSites = this.defaultFilter?.sites ?? []
    const selectedSiteIds = new Set(selectedSites.map(s => s.id))
    this.selectedSites = this.siteCheckboxItems
      .filter(cb => selectedSiteIds.has(cb.site.id))
      .map(cb => { cb.check = true; return cb.site })
  }

  public get menus (): FilterMenuItem[] {
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

  private get allSites (): SiteModels.Site[] {
    return SiteService.getMockupSites()
  }

  private setDefaultSiteCheckboxItems (): void {
    this.siteCheckboxItems = this.allSites
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(site => ({ site, check: false }))
  }

  public setActiveMenuId (id: string): void {
    this.currentActiveMenuId = id
  }

  public isCurrentActive (id: string): boolean {
    return id === this.currentActiveMenuId
  }

  public selectAllSites (): void {
    this.selectedSites = []
    this.setDefaultSiteCheckboxItems()
  }

  public updateSelectedSites (item: SiteCheckbox): void {
    const siteIdx = this.selectedSites.findIndex(s => s.id === item.site.id)
    if (siteIdx === -1) {
      this.selectedSites.push(item.site)
      item.check = true
    } else {
      this.selectedSites.splice(siteIdx, 1)
      item.check = false
    }
  }

  public get isSelectedAllSites (): boolean {
    return this.selectedSites.length === 0
  }

  @Emit()
  public apply (): FilterBase {
    this.close()
    return {
      sites: this.selectedSites,
      startDate: dayjs.utc(this.startDate),
      endDate: dayjs.utc(this.endDate)
    }
  }

  @Emit()
  public close (): boolean {
    return false
  }
}
