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

import { DateRange } from './date-range-picker-interface'

// Interface
const emit = defineEmits<{(e: 'emitSelectDateRange', value: DateRange): void}>()
const props = defineProps<{ initialDates?: DateRange}>()

const DEFAULT_DATE_RANGE: [Date, Date] = [
  dayjs().startOf('day').add(1, 'day').subtract(20, 'years').toDate(),
  dayjs().startOf('day').toDate()
]

const dateValues = ref<[Date, Date]>(DEFAULT_DATE_RANGE)

// Set/reset initial dates (ex: mount, change project)
watchEffect(() => {
  dateValues.value = props.initialDates
    ? [
      dayjs(props.initialDates.dateStartLocalIso).startOf('day').toDate(),
      dayjs(props.initialDates.dateEndLocalIso).startOf('day').add(1, 'day').toDate()
    ]
    : DEFAULT_DATE_RANGE
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
