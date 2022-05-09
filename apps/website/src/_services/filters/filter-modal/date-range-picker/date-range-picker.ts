import { IDatePickerType } from 'element-plus/es/components/date-picker/src/date-picker.type'
import { Vue } from 'vue-class-component'
import { Emit, Inject, Prop, Watch } from 'vue-property-decorator'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { BiodiversityStore } from '~/store'

export interface DateRangeShortcut {
  text: string
  value: () => [Date, Date]
}

const DATE_PICKER_TYPE: { [key: string]: IDatePickerType } = {
  date: 'daterange',
  month: 'monthrange'
}

interface DateRangeTypeOption {
  label: string
  value: IDatePickerType
}

// TODO: Remove this! This is for assume as the date range for the whole project
export const MOCK_WHOLE_PROJECT_DATE_RANGE: [Date, Date] = [dayjs().subtract(20, 'years').toDate(), dayjs().toDate()]

export default class DateRangePicker extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: null }) defaultStartDate!: string | null
  @Prop({ default: null }) defaultEndDate!: string | null

  @Emit()
  emitDateChange (): Date[] {
    // TODO: TODO: Update to the date range for the whole project when API ready
    this.dateValues = this.dateValues ?? [this.dateStartAtLatestUpdated, this.dateEndAtLatestUpdated]
    return this.dateValues
  }

  dateValues: Date[] = []
  selectedType: IDatePickerType = DATE_PICKER_TYPE.date

  get dateShortcuts (): DateRangeShortcut[] {
    return [
      {
        text: 'All dates',
        value: () => MOCK_WHOLE_PROJECT_DATE_RANGE
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

  get datePickerTypeOptions (): DateRangeTypeOption[] {
    return [
      {
        label: 'Day',
        value: DATE_PICKER_TYPE.date
      },
      {
        label: 'Month',
        value: DATE_PICKER_TYPE.month
      }
    ]
  }

  get dateStartAtLatestUpdated (): Date {
    if (!this.store.projectData.value.isData) return new Date()

    return dayjs(this.store.projectData.value.data.dateStartInclusiveUtc).toDate()
  }

  get dateEndAtLatestUpdated (): Date {
    if (!this.store.projectData.value.isData) return new Date()

    return dayjs(this.store.projectData.value.data.dateEndInclusiveUtc).toDate()
  }

  override created (): void {
    this.dateValues = [
      this.defaultStartDate ? dayjs(this.defaultStartDate).toDate() : this.dateStartAtLatestUpdated,
      this.defaultEndDate ? dayjs(this.defaultEndDate).toDate() : this.dateEndAtLatestUpdated
    ]
  }

  @Watch('dateValues')
  onDateRangeChange (): void {
    this.emitDateChange()
  }
}
