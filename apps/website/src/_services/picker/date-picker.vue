<template>
  <el-date-picker
    id="date-range-input"
    v-model="dateValues"
    type="daterange"
    unlink-panels
    range-separator="to"
    size="large"
    :clearable="false"
    :disabled-date="disableFutureDate"
  />
  <!-- :shortcuts="dateShortcuts" -->
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import type { DateRange } from './date-range-picker-interface'

// Interface
const emit = defineEmits<{(e: 'emitSelectDateRange', value: DateRange): void}>()
const props = defineProps<{ initialDates?: DateRange}>()

const DEFAULT_DATE_RANGE: [Date, Date] = [
  dayjs().startOf('day').add(1, 'day').subtract(1, 'year').toDate(),
  dayjs().startOf('day').toDate()
]

const dateValues = ref<[Date, Date]>(DEFAULT_DATE_RANGE)

const checkDateDifference = (): boolean => {
  if (!props.initialDates) return false
  const start = new Date(props.initialDates.dateStartLocalIso)
  const end = new Date(props.initialDates.dateEndLocalIso)

  const differenceInMilliseconds = Math.abs(Number(end) - Number(start))
  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365

  return differenceInMilliseconds > millisecondsInYear
}

// Set/reset initial dates (ex: mount, change project)
watchEffect(() => {
  if (!props.initialDates) {
    dateValues.value = DEFAULT_DATE_RANGE
  } else {
    dateValues.value = [
      checkDateDifference() ? dayjs(props.initialDates.dateEndLocalIso).startOf('day').subtract(1, 'year').toDate() : dayjs(props.initialDates.dateStartLocalIso).startOf('day').toDate(),
      dayjs(props.initialDates.dateEndLocalIso).startOf('day').add(1, 'day').toDate()
    ]
  }
})

// Emit on change
const emitSelectDateRange = (dateRange: [Date, Date]): void => {
  // Only keep the date part (throw away time & timezone)
  const dateStartLocalIso = dayjs(dateRange[0]).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  const dateEndLocalIso = dayjs(dateRange[1]).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  emit('emitSelectDateRange', { dateStartLocalIso, dateEndLocalIso })
}

watchEffect(() => { emitSelectDateRange(dateValues.value) })

const disableFutureDate = (date: Date): boolean => date > dayjs().toDate()

</script>
