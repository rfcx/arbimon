import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { FilterBase, SpeciesRichnessFilter, StreamModels } from '@/models'
import { StreamServices } from '@/services'

interface FilterMenuItem {
  id: string
  name: string
}

interface StreamCheckbox {
  stream: StreamModels.Stream
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

  public selectedStreams: StreamModels.Stream[] = []
  public streamCheckboxItems: StreamCheckbox[] = []
  public startDate: string | null = dayjs().subtract(7, 'days').format(dateFormat)
  public endDate: string | null = dayjs().format(dateFormat)
  public readonly today = dayjs().format(dateFormat)
  public currentActiveMenuId = 'sites'

  public mounted (): void {
    if (this.defaultFilter) {
      this.setDefaultSelectedStreams()
      this.startDate = this.defaultFilter.startDate?.format(dateFormat) ?? dayjs().subtract(7, 'days').format(dateFormat)
      this.endDate = this.defaultFilter.endDate?.format(dateFormat) ?? dayjs().format(dateFormat)
    }
  }

  public setDefaultSelectedStreams (): void {
    this.setDefaultStreamCheckboxItems()
    const selectedSites = this.defaultFilter?.streams ?? []
    const selectedSiteIds = new Set(selectedSites.map(s => s.id))
    this.selectedStreams = this.streamCheckboxItems
      .filter(cb => selectedSiteIds.has(cb.stream.id))
      .map(cb => { cb.check = true; return cb.stream })
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

  private get allSites (): StreamModels.Stream[] {
    return StreamServices.getMockupStreams()
  }

  private setDefaultStreamCheckboxItems (): void {
    this.streamCheckboxItems = this.allSites
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(s => {
        return {
          stream: s,
          check: false
        }
      })
  }

  public setActiveMenuId (id: string): void {
    this.currentActiveMenuId = id
  }

  public isCurrentActive (id: string): boolean {
    return id === this.currentActiveMenuId
  }

  public selectAllSites (): void {
    this.selectedStreams = []
    this.setDefaultStreamCheckboxItems()
  }

  public updateSelectedStreams (item: StreamCheckbox): void {
    const streamIdx = this.selectedStreams.findIndex(s => s.id === item.stream.id)
    if (streamIdx === -1) {
      this.selectedStreams.push(item.stream)
      item.check = true
    } else {
      this.selectedStreams.splice(streamIdx, 1)
      item.check = false
    }
  }

  public get isSelectedAllSites (): boolean {
    return this.selectedStreams.length === 0
  }

  @Emit()
  public apply (): FilterBase {
    this.close()
    return {
      streams: this.selectedStreams,
      startDate: dayjs.utc(this.startDate),
      endDate: dayjs.utc(this.endDate)
    }
  }

  @Emit()
  public close (): boolean {
    return false
  }
}
