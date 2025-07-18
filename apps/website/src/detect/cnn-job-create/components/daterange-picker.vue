<template>
  <div
    id="dateRangePicker"
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
import { computed, onMounted, ref, watch } from 'vue'

import { type GetRecordedMinutesPerDay, type GetRecordedMinutesPerDayResponse } from '@rfcx-bio/common/api-bio/cnn/recorded-minutes-per-day'

import { type DateRange, type FlowbiteDatePicker, initDatePicker } from '@/_components/date-range-picker'

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

let startDatePicker: FlowbiteDatePicker | undefined
let endDatePicker: FlowbiteDatePicker | undefined

onMounted(() => {
  if (startDatePickerInput.value) {
    startDatePicker = initDatePicker(startDatePickerInput.value)
  }
  if (endDatePickerInput.value) {
    endDatePicker = initDatePicker(endDatePickerInput.value)
  }
  setDatePickerOptions()
  addPickerListener()
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

const startDateMaxDate = computed(() => endDateConverted.value ?? dayjs().format(format))
const endDateMinDate = computed(() => startDateConverted.value ?? dayjs().format(format))

const setDatePickerOptions = () => {
  const beforeShowDay = (date: Date) => {
    const day = date.getDate()
    const dayConverted = dateToCalendarFormat(date)
    const count = recordedMinutesPerDayConverted.value[dayConverted as string] ?? 0
    return {
      content: `<span>${day}</span><br><span style="font-size:10px;"
        class="${count > 0 ? 'text-frequency' : 'text-spoonbill'}">${count}</span>`
    }
  }
  startDatePicker?.setOptions({ beforeShowDay, maxDate: startDateMaxDate.value })
  endDatePicker?.setOptions({ beforeShowDay, minDate: endDateMinDate.value, maxDate: dayjs().format(format) })
}

const addPickerListener = () => {
  startDatePicker?.element.addEventListener('changeDate', () => {
    const start = startDatePicker?.getDate()
    startDateChanged.value = (start instanceof Date) ? dayjs(start).toISOString() : ''
  })
  endDatePicker?.element.addEventListener('changeDate', () => {
    const end = endDatePicker?.getDate()
    endDateChanged.value = (end instanceof Date) ? dayjs(end).toISOString() : ''
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

watch(() => [startDateMaxDate, endDateMinDate, recordedMinutesPerDayConverted], () => {
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

  .datepicker-cell {
    padding: 5px 10px 10px;
    border: 1px solid transparent !important;

  }

  .datepicker-cell:hover {
    background-color: #4B4B4B !important;
  }

  .datepicker-cell:active {
    background-color: rgb(173, 255, 44, 0.4) !important;
    border: 1px solid #ADFF2C;
  }

</style>
