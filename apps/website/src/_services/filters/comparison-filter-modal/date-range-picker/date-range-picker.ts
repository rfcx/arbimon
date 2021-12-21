import { Vue } from 'vue-class-component'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

export interface DateRangeShortcut {
  text: string
  value: () => [Date, Date]
}

export default class DateRangePicker extends Vue {
  dateValues: Date[] = []

  get dateShortcuts (): DateRangeShortcut[] {
    return [
      {
        text: 'All detections dates',
        value: () => {
          const start = dayjs().subtract(20, 'years').toDate()
          const end = dayjs().toDate()
          return [start, end]
        }
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
}
