import { Vue } from 'vue-class-component'
import { Emit, Watch } from 'vue-property-decorator'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

export interface DateRangeShortcut {
  text: string
  value: () => [Date, Date]
}

export const DEFAULT_DATE_RANGE: [Date, Date] = [dayjs().subtract(20, 'years').toDate(), dayjs().toDate()]

export default class DateRangePicker extends Vue {
  @Emit()
  emitDateChange (): [Date, Date] {
    return this.dateValues
  }

  dateValues: [Date, Date] = DEFAULT_DATE_RANGE

  get dateShortcuts (): DateRangeShortcut[] {
    return [
      {
        text: 'All dates',
        value: () => DEFAULT_DATE_RANGE
      },
      {
        text: 'This year',
        value: () => {
          const start = dayjs().startOf('year').toDate()
          const end = dayjs().toDate()
          return [start, end]
        }
      },
      {
        text: 'Last year',
        value: () => {
          const start = dayjs().subtract(1, 'years').toDate()
          const end = dayjs().subtract(1, 'years').endOf('year').toDate()
          return [start, end]
        }
      }
    ]
  }

  @Watch('dateValues')
  onDateRangeChange (): void {
    this.emitDateChange()
  }
}
