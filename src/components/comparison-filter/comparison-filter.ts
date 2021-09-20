import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { FilterBase, StreamModels } from '@/models'

interface FilterMenuItem {
  id: string
  name: string
}

const dateFormat = 'YYYY-MM-DD'

@Options({
  components: {
    OnClickOutside
  }
})
export default class ComparisonFilterComponent extends Vue {
  public selectedStreams: StreamModels.Stream[] = []
  public startDate: string | null = dayjs().subtract(7, 'days').format(dateFormat)
  public endDate: string | null = dayjs().format(dateFormat)
  public readonly today = dayjs().format(dateFormat)
  public currentActivateMenuId = 'sites'

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

  public get streams (): StreamModels.Stream[] {
    return [
      {
        id: 'abc',
        name: 'ABC'
      },
      {
        id: 'def',
        name: 'DEF'
      },
      {
        id: 'ghi',
        name: 'GHI'
      }
    ]
  }

  public setActivateMenuId (id: string): void {
    this.currentActivateMenuId = id
  }

  public isCurrentActivate (id: string): boolean {
    return id === this.currentActivateMenuId
  }

  public updateSelectedStreams (item: StreamModels.Stream): void {
    const streamIdx = this.selectedStreams.findIndex(s => s.id === item.id)
    if (streamIdx === -1) {
      this.selectedStreams.push(item)
    } else {
      this.selectedStreams.splice(streamIdx, 1)
    }
  }

  public get disabled (): boolean {
    console.log(this.selectedStreams)
    return this.startDate == null || this.endDate == null || this.selectedStreams.length === 0
  }

  @Emit()
  public apply (): FilterBase {
    this.close()
    return {
      streams: this.selectedStreams,
      startDate: dayjs(this.startDate),
      endDate: dayjs(this.endDate)
    }
  }

  @Emit()
  public close (): boolean {
    return false
  }
}
