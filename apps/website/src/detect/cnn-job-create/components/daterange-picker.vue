<template>
  <div
    id="dateRangePickerId"
    date-rangepicker
    datepicker-format="'dd-mm-yyyy'"
    class="flex mt-6 items-center gap-4 md:flex-row"
  >
    <div class="flex-1">
      <label
        class="block mb-2 font-medium text-gray-900 dark:text-secondary"
      >Start date</label>
      <div class="relative flex-1">
        <input
          ref="startDatePickerInput"
          class="w-full border text-secondary border-util-gray-03 rounded-md
            dark:(bg-pitch text-secondary placeholder:text-placeholder) focus:(border-frequency ring-frequency)"
          type="text"
          placeholder="Choose start date"
        >
      </div>
    </div>
    <span class="mt-7 hidden md:block">-</span>
    <div class="flex-1">
      <label
        class="block mb-2 font-medium text-gray-900 dark:text-secondary"
      >End date</label>
      <div class="relative flex-1">
        <input
          ref="endDatePickerInput"
          class="w-full border text-secondary border-util-gray-03 rounded-md
            dark:(bg-pitch text-secondary placeholder:text-placeholder) focus:(border-frequency ring-frequency)"
          type="text"
          placeholder="Choose end date"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import numeral from 'numeral'
import { computed, onMounted, ref, watch } from 'vue'

import { type GetRecordedMinutesPerDay, type GetRecordedMinutesPerDayResponse } from '@rfcx-bio/common/api-bio/cnn/recorded-minutes-per-day'

import { type DateRange, type FlowbiteDateRangePicker } from '@/_components/date-range-picker'

const props = defineProps<{
  initialDateStart?: string,
  initialDateEnd?: string
  recordedMinutesPerDay?: GetRecordedMinutesPerDayResponse
}>()

const format = 'DD-MM-YYYY'

const startDateChanged = ref('')
const endDateChanged = ref('')

const emit = defineEmits<{(e: 'emitSelectDateRange', value: DateRange): void}>()

const dateToCalendarFormat = (date: string | Date) => {
  return dayjs(date).format(format)
}

const startDatePickerInput = ref<HTMLInputElement>()
const endDatePickerInput = ref<HTMLInputElement>()

let picker: FlowbiteDateRangePicker | undefined

onMounted(async () => {
  const { initDateRangePicker } = await import('@/_components/date-range-picker')
  if (typeof window !== 'undefined') {
    const dateRangePickerEl = document.getElementById('dateRangePickerId')
    if (startDatePickerInput.value && endDatePickerInput.value && dateRangePickerEl) {
      picker = initDateRangePicker(dateRangePickerEl, {
        inputs: [startDatePickerInput.value, endDatePickerInput.value],
        autohide: true,
        format: 'dd/mm/yyyy',
        allowOneSidedRange: false,
        minDate: startDate.value,
        maxDate: dayjs().format(format)
      })
      addPickerListener()
      setDatePickerOptions()
    }
  }
})

const startDateConverted = ref<string>(props.initialDateStart !== undefined ? dateToCalendarFormat(props.initialDateStart) : '')
const endDateConverted = ref<string>(props.initialDateEnd !== undefined ? dateToCalendarFormat(props.initialDateEnd) : '')

const recordedMinutesPerDayConverted = computed(() => {
  const tempObj: Record<string, number> = {}
  props.recordedMinutesPerDay?.forEach((rec: GetRecordedMinutesPerDay) => {
    const convertedDate = rec.date.split('-').reverse().join('-')
    tempObj[convertedDate] = rec.recordedMinutesCount
  })
  return tempObj
})

const startDate = computed(() => startDateConverted.value ?? dayjs().format(format))
const endDate = computed(() => endDateConverted.value ?? dayjs().format(format))

const setDatePickerOptions = () => {
  const beforeShowDay = (date: Date) => {
    const day = date.getDate()
    const dayConverted = dateToCalendarFormat(date)
    const minutes = recordedMinutesPerDayConverted.value[dayConverted as string] ?? 0
    return {
      content: `<div style="line-height:1.25rem;padding-top:5px" class="${minutes === 0 ? 'text-util-gray-02' : 'text-insight'}">${day}</div>
        <div style="font-size:10px;line-height:1.25rem;padding-bottom:5px"
        class="${minutes >= 10000 ? 'text-insight' : minutes === 0 ? 'text-util-gray-02' : 'text-flamingo'}">
        ${convertMinutestoCount(minutes)}</div>`
    }
  }
  picker?.setOptions({ beforeShowDay })
  const footerElement = document.querySelector('.datepicker-footer')
  if (footerElement) {
    const newDiv = document.createElement('div')
    newDiv.textContent = 'NUMBER BELOW DATES = MINUTES OF RECORDING'
    newDiv.classList.add('datepicker-footer-text')
    footerElement.appendChild(newDiv)
  }
}

const convertMinutestoCount = (minutes: number): string => {
  const count = numeral(minutes).format(minutes > 999999999 ? '0,0am' : '0,0.[0]a')
  return minutes > 0 ? count.toString() : '-'
}

const addPickerListener = () => {
  startDatePickerInput.value?.addEventListener('changeDate', () => {
    const dates = picker?.getDates()
    startDateChanged.value = dates !== undefined && (dates[0] instanceof Date) ? dayjs(dates[0]).format('YYYY-MM-DD') + 'T00:00:00.000Z' : ''
  })
  endDatePickerInput.value?.addEventListener('changeDate', () => {
    const dates = picker?.getDates()
    endDateChanged.value = dates !== undefined && (dates[1] instanceof Date) ? dayjs(dates[1]).format('YYYY-MM-DD') + 'T00:00:00.000Z' : ''
  })
}

const emitValue = computed(() => {
  return {
    dateStartLocalIso: startDateChanged.value,
    dateEndLocalIso: endDateChanged.value
  }
})

watch(() => emitValue.value, (newValue) => {
  emit('emitSelectDateRange', newValue)
})

watch(() => [startDate, endDate, recordedMinutesPerDayConverted], () => {
  setDatePickerOptions()
})

</script>
<style lang="scss">

  .datepicker-picker {
    background-color: #1e1c13 !important;
  }

  .datepicker-controls button {
    background-color: #4B4B4B !important;
  }

  .datepicker-cell:hover {
    background-color: #4B4B4B !important;
  }

  .selected, .range-start, .range-end {
    background-color: rgb(173, 255, 44, 0.15) !important;
    border: 1px solid #ADFF2C !important;
  }

  .datepicker-grid.w-64 {
    width: 22rem;
  }

  .datepicker-cell.\!bg-primary-700,
  .datepicker-cell.range {
    background-color: rgb(173, 255, 44, 0.15) !important;
  }

  .datepicker-cell.leading-9 {
    line-height: 1.6rem !important;
  }

  .datepicker-footer-text {
    font-size: 14px;
  }

  .rounded-l-lg, .rounded-r-lg {
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

</style>
