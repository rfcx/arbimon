<template>
  <div class="flex flex-col text-sm font-medium">
    <label
      v-if="!hideLabel"
      class="block mb-2 font-medium text-gray-900 dark:text-secondary"
    >
      {{ inputLabelFormatted }}
    </label>

    <div class="relative flex-1">
      <input
        ref="datePickerInput"
        class="w-full border text-secondary border-util-gray-02 rounded-md h-[34px] pl-7 pr-5 text-sm font-medium
          dark:(bg-echo text-secondary placeholder:text-placeholder)
          disabled:(cursor-not-allowed opacity-60 border-util-gray-04)"
        type="text"
        :placeholder="placeholder"
        :disabled="isDisabled"
      >
      <div
        v-if="isDisabled || !hasSelected"
        class="overlay-date pointer-events-none absolute inset-0 flex items-center justify-center rounded-md
               bg-echo gap-2 transition-colors"
        :class="isDisabled ? 'text-secondary/60' : 'text-insight'"
      >
        <icon-fa-calendar class="h-4 w-4" />
        <span class="text-sm lowercase tracking-wide">date</span>
        <icon-fa-chevron-down class="w-[9px] h-[9px]" />
      </div>
      <div v-else>
        <icon-fa-calendar
          class="pointer-events-none absolute left-2 top-[8px] -translate-y-1/2 h-4 w-4 text-insight"
        />
        <icon-fa-chevron-down class="pointer-events-none absolute right-2 top-[12px] -translate-y-1/2 w-[9px] h-[9px] text-insight" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import numeral from 'numeral'
import { computed, onMounted, ref, watch } from 'vue'

import { type GetRecordedMinutesPerDay, type GetRecordedMinutesPerDayResponse } from '@rfcx-bio/common/src/api-bio/cnn/recorded-minutes-per-day'

import { type FlowbiteDatePicker } from './date-range-picker'

const props = defineProps<{
  initialDate?: string
  initialViewYear?: number
  initialViewMonth?: number
  hideLabel?: boolean
  inputLabel?: string
  placeholder?: string
  recordedMinutesPerDay?: GetRecordedMinutesPerDayResponse
  disabled?: boolean
}>()

const emit = defineEmits<{(e: 'emitSelectDate', value: { dateLocalIso: string }): void, (e: 'emitChangedYear', value: { year: string }): void}>()

const format = 'DD-MM-YYYY'
const datePickerInput = ref<HTMLInputElement>()
const picker = ref<FlowbiteDatePicker>()
const selectedDateIso = ref('')

const placeholder = computed(() => props.placeholder ?? 'Choose date')
const inputLabelFormatted = computed(() => props.inputLabel ?? 'Date')
const isDisabled = computed(() => props.disabled === true)
const hasSelected = computed(() => selectedDateIso.value !== '')

const recordedMinutesPerDayConverted = computed(() => {
  const temp: Record<string, number> = {}
  props.recordedMinutesPerDay?.forEach((rec: GetRecordedMinutesPerDay) => {
    const converted = rec.date.split('-').reverse().join('-')
    temp[converted] = rec.recordedMinutesCount
  })
  return temp
})

const convertMinutestoCount = (minutes: number): string => {
  const count = numeral(minutes).format(minutes > 999999999 ? '0,0am' : '0,0.[0]a')
  return minutes > 0 ? count.toString() : '-'
}

const beforeShowDay = (date: Date) => {
  const day = date.getDate()
  const dayFormatted = dayjs(date).format(format)
  const isFutureDate = dayjs(date).isAfter(dayjs(), 'day')
  const minutes = recordedMinutesPerDayConverted.value[dayFormatted] ?? 0
  return {
    content: `
      <div style="line-height:1.25rem;padding-top:5px;${isFutureDate ? 'cursor:not-allowed!important' : ''}"
        class="${minutes === 0 && props.recordedMinutesPerDay ? 'text-util-gray-02' : 'text-insight'}">${day}</div>
      <div style="font-size:10px;line-height:1.25rem;padding-bottom:5px;"
        class="${minutes >= 10000 ? 'text-insight' : minutes === 0 ? 'text-util-gray-02' : 'text-flamingo'}">
        ${props.recordedMinutesPerDay ? convertMinutestoCount(minutes) : ''}
      </div>`
  }
}

const beforeShowMonth = (date: Date) => {
  const calendarMonth = date.getMonth()
  let existingMonths: number[] = []
  if (props.recordedMinutesPerDay !== undefined && props.recordedMinutesPerDay[0] !== undefined) {
    if (new Date(props.recordedMinutesPerDay[0].date).getUTCFullYear() === date.getUTCFullYear()) {
      existingMonths = props.recordedMinutesPerDay.map(row => new Date(row.date).getMonth())
    }
  }
  return {
    content: `
      <div class="${existingMonths.includes(calendarMonth) && props.recordedMinutesPerDay ? 'text-frequency' : 'text-util-gray-02'}">
        ${date.toLocaleString('en-US', { month: 'short' })}
      </div>`
  }
}

onMounted(async () => {
  const { initDatePicker } = await import('./date-range-picker')
  if (!datePickerInput.value) return

  picker.value = initDatePicker(datePickerInput.value, {
    autohide: true,
    format: 'dd-mm-yyyy',
    maxView: 1,
    startView: 1,
    pickLevel: 0,
    beforeShowDay,
    beforeShowMonth,
    nextArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-4 rdp-chevron"><path d="m9 18 6-6-6-6"></path></svg>',
    prevArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left size-4 rdp-chevron"><path d="m15 18-6-6 6-6"></path></svg>'
  })

  datePickerInput.value.addEventListener('changeYear', (e: any) => {
    const yearIso = dayjs(e.detail.viewDate).format('YYYY')
    emit('emitChangedYear', { year: yearIso })
  })

  if (props.initialViewYear != null && props.initialViewMonth != null) {
    const temp = new Date(props.initialViewYear, props.initialViewMonth - 1, 1)
    picker.value.setDate(temp)
  }

  if (props.initialDate !== undefined) {
    datePickerInput.value.value = dayjs(props.initialDate).format(format)
    const dateIso = dayjs(datePickerInput.value.value).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    selectedDateIso.value = dateIso
  }

  datePickerInput.value.addEventListener('changeDate', () => {
    const dates = picker.value?.getDate()
    if (dates === undefined || dates === null || !(dates instanceof Date)) return
    const dateIso = dayjs(dates).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    selectedDateIso.value = dateIso
    emit('emitSelectDate', { dateLocalIso: dateIso })
  })
})

watch(() => props.recordedMinutesPerDay, () => {
  picker.value?.setOptions({ beforeShowDay, beforeShowMonth })
})

watch(() => props.initialDate, (v) => {
  if (v === '') {
    if (datePickerInput.value) datePickerInput.value.value = ''
    selectedDateIso.value = ''
  } else {
    const formatted = dayjs(v).format(format)
    picker.value?.setDate(formatted)
    if (datePickerInput.value) datePickerInput.value.value = formatted
    selectedDateIso.value = dayjs(props.initialDate).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  }
})

function updateViewDate () {
  const year = props.initialViewYear
  const month = props.initialViewMonth
  if (year == null || month == null) return

  const temp = new Date(year, month - 1, 1)
  // do not update the calendar if initialDate was changed it will be processed by watcher for initialDate
  if (props.initialDate) return
  picker.value?.setDate(temp)
  if (datePickerInput.value) datePickerInput.value.value = ''
  selectedDateIso.value = ''
}

watch(() => props.initialViewYear, () => {
  // do not update the calendar if pre-selected year is equal to a selected year
  if (props.initialDate && dayjs.utc(props.initialDate).year() === props.initialViewYear) return
  updateViewDate()
})
watch(() => props.initialViewMonth, () => {
  // do not update calendar if pre selected month is equal to a selected month
  if (props.initialDate && ((dayjs.utc(props.initialDate).month() + 1) === props.initialViewMonth)) return
  updateViewDate()
})

function resetDatePicker (preset?: { date: string }) {
  if (preset?.date) {
    const formatted = dayjs(preset.date).format(format)
    picker.value?.setDate(formatted)
    if (datePickerInput.value) datePickerInput.value.value = formatted
    selectedDateIso.value = dayjs(preset.date).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    emit('emitSelectDate', { dateLocalIso: selectedDateIso.value })
  } else {
    picker.value?.setDate('')
    selectedDateIso.value = ''
    if (datePickerInput.value) datePickerInput.value.value = ''
    emit('emitSelectDate', { dateLocalIso: '' })
  }
}

defineExpose({ resetDatePicker })
</script>

<style lang="scss">
.datepicker-picker { background-color: #242424; border-width: 0; }
.datepicker-controls button { background-color: #4B4B4B !important; }
.selected { background-color: #adff2c26 !important; }
.datepicker-grid.w-64 { font-family: Geist, "Geist Fallback"; font-size: 16px; width: 22rem; }
.datepicker-cell.range { background-color: rgb(173,255,44,0.15)!important; }
.datepicker-cell.leading-9 { line-height: 1.6rem!important; }
.datepicker-footer-text { font-size: 14px; }
.focus\:ring-frequency:focus,
.focus\:border-frequency:focus {
  --tw-ring-color: #0a0a0a !important;
  --tw-ring-offset-shadow: 0 0 0 0 #0a0a0a !important;
  --tw-ring-shadow: 0 0 0 1px #0a0a0a !important;
  border-color: #0a0a0a !important;
  box-shadow: 0 0 0 1px #0a0a0a !important;
}
.relative:hover input:not(:disabled) + .overlay-date {
  background-color: #0a0a0a !important;
  border-color: #0a0a0a !important;
  --tw-ring-color: #0a0a0a !important;
  --tw-ring-offset-shadow: 0 0 0 0 #0a0a0a !important;
  --tw-ring-shadow: 0 0 0 1px #0a0a0a !important;
  border-color: #0a0a0a !important;
  box-shadow: 0 0 0 1px #0a0a0a !important;
}

.relative:focus-within input:not(:disabled) + .overlay-date {
  background-color: #0a0a0a !important;
  border-color: #0a0a0a !important;
  --tw-ring-color: #0a0a0a !important;
  --tw-ring-offset-shadow: 0 0 0 0 #0a0a0a !important;
  --tw-ring-shadow: 0 0 0 1px #0a0a0a !important;
  border-color: #0a0a0a !important;
  box-shadow: 0 0 0 1px #0a0a0a !important;
}

input[type='text']:not(:disabled):focus {
  background-color: #0a0a0a !important;
  border-color: #ADFF2C !important;
  box-shadow: 0 0 0 1px #0a0a0a !important;
}

input[type='text']:not(:disabled):hover {
  background-color: #0a0a0a !important;
  border-color: #ADFF2C !important;
}

input[type='text']:disabled {
  background-color: #2a2a2a !important; /* หรือใช้ bg-util-gray-04 */
  border-color: #3a3a3a !important;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
