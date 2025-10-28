<template>
  <div class="flex flex-col">
    <label
      v-if="!hideLabel"
      class="block mb-2 font-medium text-gray-900 dark:text-secondary"
    >
      {{ inputLabelFormatted }}
    </label>

    <div class="relative flex-1">
      <input
        ref="datePickerInput"
        class="w-full border text-secondary border-util-gray-03 rounded-md h-[34px]
          dark:(bg-pitch text-secondary placeholder:text-placeholder)
          focus:(border-frequency ring-frequency)"
        type="text"
        :placeholder="placeholder"
      >
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
  hideLabel?: boolean
  inputLabel?: string
  placeholder?: string
  recordedMinutesPerDay?: GetRecordedMinutesPerDayResponse
}>()

const emit = defineEmits<{(e: 'emitSelectDate', value: { dateLocalIso: string }): void}>()

const format = 'DD-MM-YYYY'
const datePickerInput = ref<HTMLInputElement>()
const picker = ref<FlowbiteDatePicker>()
const selectedDateIso = ref('')

const placeholder = computed(() => props.placeholder ?? 'Choose date')
const inputLabelFormatted = computed(() => props.inputLabel ?? 'Date')

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

onMounted(async () => {
  const { initDatePicker } = await import('./date-range-picker')
  if (!datePickerInput.value) return

  const initDate = props.initialDate
    ? dayjs(props.initialDate).format(format)
    : dayjs().format(format)

  datePickerInput.value.value = initDate

  picker.value = initDatePicker(datePickerInput.value, {
    autohide: true,
    format: 'dd/mm/yyyy',
    maxView: 1,
    beforeShowDay,
    nextArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-4 rdp-chevron"><path d="m9 18 6-6-6-6"></path></svg>',
    prevArrow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left size-4 rdp-chevron"><path d="m15 18-6-6 6-6"></path></svg>'
  })

  datePickerInput.value.addEventListener('changeDate', () => {
    const dates = picker.value?.getDate()
    if (dates === undefined || dates === null || !(dates instanceof Date)) return
    const dateIso = dayjs(dates).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    selectedDateIso.value = dateIso
    emit('emitSelectDate', { dateLocalIso: dateIso })
  })
})

watch(() => props.recordedMinutesPerDay, () => {
  picker.value?.setOptions({ beforeShowDay })
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
.datepicker-picker { background-color: #1e1c13 !important; }
.datepicker-controls button { background-color: #4B4B4B !important; }
.datepicker-cell:hover { background-color: #4B4B4B !important; }
.selected {
  background-color: #adff2c26 !important;
  border: 1px solid #ADFF2C !important;
}
.datepicker-grid.w-64 { font-family: Geist, "Geist Fallback"; font-size: 16px; width: 22rem; }
.datepicker-cell.range { background-color: rgb(173,255,44,0.15)!important; }
.datepicker-cell.leading-9 { line-height: 1.6rem!important; }
.datepicker-footer-text { font-size: 14px; }
</style>
