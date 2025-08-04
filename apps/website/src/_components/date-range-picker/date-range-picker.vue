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
      >{{ inputLabelStartFormatted }}</label>
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
      >{{ inputLabelEndFormatted }}</label>
      <div
        class="relative flex-1"
      >
        <input
          ref="endDatePickerInput"
          class="w-full border text-secondary border-util-gray-03 rounded-md
            dark:(bg-pitch text-secondary placeholder:text-placeholder) focus:(border-frequency ring-frequency)"
          :class="{'cursor-not-allowed': onGoing}"
          type="text"
          placeholder="Choose end date"
          :disabled="onGoing"
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

import { type DateRange, type FlowbiteDateRangePicker } from './date-range-picker'

const props = defineProps<{
  initialDateStart?: string,
  initialDateEnd?: string,
  onGoing?: boolean,
  inputLabelStart?: string,
  inputLabelEnd?: string,
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
const startDatePickerInputChanged = ref<boolean>(false)
const endDatePickerInputChanged = ref<boolean>(false)
const onGoing = ref<boolean>(props.onGoing || false)

let picker: FlowbiteDateRangePicker | undefined

onMounted(async () => {
  const { initDateRangePicker } = await import('./date-range-picker')
  if (typeof window !== 'undefined') {
    const dateRangePickerEl = document.getElementById('dateRangePickerId')
    if (startDatePickerInput.value && endDatePickerInput.value && dateRangePickerEl) {
      picker = initDateRangePicker(dateRangePickerEl, {
        inputs: [startDatePickerInput.value, endDatePickerInput.value],
        autohide: true,
        format: 'dd/mm/yyyy',
        allowOneSidedRange: false,
        minDate: startDate.value,
        maxDate: dayjs().format(format),
        maxView: 1,
        nextArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-4 rdp-chevron"><path d="m9 18 6-6-6-6"></path></svg>',
        prevArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left size-4 rdp-chevron"><path d="m15 18-6-6 6-6"></path></svg>'
      })
      addPickerListener()
      setDatePickerOptions()
    }
  }
})

const startDateConverted = ref<string>(props.initialDateStart !== undefined ? dateToCalendarFormat(props.initialDateStart) : '')
const endDateConverted = ref<string>(props.initialDateEnd !== undefined ? dateToCalendarFormat(props.initialDateEnd) : '')
const inputLabelStartFormatted = ref<string>(props.inputLabelStart !== undefined ? props.inputLabelStart : 'Start date')
const inputLabelEndFormatted = ref<string>(props.inputLabelEnd !== undefined ? props.inputLabelEnd : 'End date')

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
    const isFutureDate = dayjs(dayjs(date).format('YYYY-MM-DD') + 'T00:00:00.000Z').toDate() > dayjs().toDate()
    const minutes = recordedMinutesPerDayConverted.value[dayConverted as string] ?? 0
    const datepickers = document.querySelectorAll('body > div.datepicker')
    const isStartHidden = datepickers[0] !== undefined && datepickers[0].classList.contains('hidden')
    const isEndHidden = datepickers[1] !== undefined && datepickers[1].classList.contains('hidden')
    const monthInCalendar = document.querySelectorAll('.view-switch')
    const hideDates = isStartHidden ? (monthInCalendar[1].innerHTML.replace(/[^a-zA-Z]+/g, '') !== dayjs(date).format('MMMM')) : isEndHidden ? monthInCalendar[0].innerHTML.replace(/[^a-zA-Z]+/g, '') !== dayjs(date).format('MMMM') : false
    return {
      content: `<div style="line-height:1.25rem;${props.recordedMinutesPerDay ? 'padding-top:5px' : 'padding:10px'};${isFutureDate ? 'cursor: not-allowed!important' : 'cursor: cursor-pointer'};${hideDates ? 'display:none' : 'display:block'}" class="${(minutes === 0 && props.recordedMinutesPerDay !== undefined) ? 'text-util-gray-02' : 'text-insight'} ${hideDates ? 'hide-child' : ''}">${day}</div>
        <div style="font-size:10px;line-height:1.25rem;padding-bottom:5px;${isFutureDate ? 'cursor: not-allowed!important' : 'cursor: cursor-pointer'};${(props.recordedMinutesPerDay === undefined || hideDates) ? 'display:none' : 'display:block'}"
        class="${minutes >= 10000 ? 'text-insight' : minutes === 0 ? 'text-util-gray-02' : 'text-flamingo'}">
        ${convertMinutestoCount(minutes)}</div>`
    }
  }
  picker?.setOptions({ beforeShowDay })
  const footerElement = document.querySelector('.datepicker-footer')
  if (footerElement && props.recordedMinutesPerDay) {
    const newDiv = document.createElement('div')
    newDiv.textContent = 'NUMBER BELOW DATES = MINUTES OF RECORDING'
    newDiv.classList.add('datepicker-footer-text')
    footerElement.appendChild(newDiv)
  }
  const targets = document.querySelectorAll('.hide-child')
  if (targets.length) {
    targets.forEach(target => {
      target.parentElement?.classList.add('not-visible')
    })
  }
}

const convertMinutestoCount = (minutes: number): string => {
  const count = numeral(minutes).format(minutes > 999999999 ? '0,0am' : '0,0.[0]a')
  return minutes > 0 ? count.toString() : '-'
}

const addPickerListener = () => {
  const datepickerPicker = document.querySelector('.datepicker-picker')
  datepickerPicker?.addEventListener('click', () => {
    const targets = document.querySelectorAll('.hide-child')
    if (targets.length) {
      targets.forEach(target => {
        target.parentElement?.classList.add('not-visible')
      })
    }
  })
  startDatePickerInput.value?.addEventListener('input', () => {
    startDatePickerInputChanged.value = true
    endDatePickerInputChanged.value = false
  })
  endDatePickerInput.value?.addEventListener('input', () => {
    startDatePickerInputChanged.value = false
    endDatePickerInputChanged.value = true
  })
  startDatePickerInput.value?.addEventListener('changeDate', () => {
    const dates = picker?.getDates()
    if (dates === undefined) return
    if ((dates[0] instanceof Date)) {
      startDateChanged.value = dayjs(dates[0]).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    }
    if (dates[0] === undefined && dates[1] === undefined && endDatePickerInputChanged.value === true) {
      picker?.setDates(dateToCalendarFormat(startDateChanged.value), '')
    }
  })
  endDatePickerInput.value?.addEventListener('changeDate', () => {
    const dates = picker?.getDates()
    if (dates === undefined) return
    if ((dates[1] instanceof Date)) {
      endDateChanged.value = dayjs(dates[1]).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    }
    if (dates[0] === undefined && dates[1] === undefined && startDatePickerInputChanged.value === true) {
      picker?.setDates('', dateToCalendarFormat(endDateChanged.value))
    }
  })
}

const emitValue = computed(() => {
  return {
    dateStartLocalIso: startDateChanged.value,
    dateEndLocalIso: endDateChanged.value
  }
})

watch(() => props.onGoing, (newValue) => {
  onGoing.value = newValue
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
    font-family: Geist, "Geist Fallback";
    font-feature-settings: normal;
    font-kerning: auto;
    font-optical-sizing: auto;
    font-size: 16px;
    font-size-adjust: none;
    font-stretch: 100%;
    font-style: normal;
    font-synthesis-weight: none;
    font-variant-alternates: normal;
    font-variant-caps: normal;
    font-variant-east-asian: normal;
    font-variant-emoji: normal;
    font-variant-ligatures: normal;
    font-variant-numeric: normal;
    font-variant-position: normal;
    font-variation-settings: normal;
    font-weight: 400;
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

  .hide-child, .not-visible {
    pointer-events: none !important;
    user-select: none !important;
  }

  .rounded-l-lg, .rounded-r-lg {
    border-top-left-radius: 0.2rem !important;
    border-bottom-left-radius: 0.2rem !important;
    border-top-right-radius: 0.2rem !important;
    border-bottom-right-radius: 0.2rem !important;
  }

  .datepicker-grid .datepicker-cell:nth-child(n+36) {
    display: none; /* hides row 6 */
  }

</style>
