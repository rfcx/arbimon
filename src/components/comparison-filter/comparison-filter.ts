import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { FilterBase, StreamModels } from '@/models'
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

  public get streams (): StreamCheckbox[] {
    const streams = StreamServices.getMockupStreams()
    return streams.map(s => {
      return {
        stream: s,
        check: false
      }
    })
  }

  public setActivateMenuId (id: string): void {
    this.currentActivateMenuId = id
  }

  public isCurrentActivate (id: string): boolean {
    return id === this.currentActivateMenuId
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

  public get disabled (): boolean {
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
