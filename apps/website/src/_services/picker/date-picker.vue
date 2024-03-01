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

<style lang="scss">
.el-input__wrapper {
  border: 1px solid #F9F6F2 !important;
  box-shadow: none !important;
}

.el-icon {
  color: #fff !important;
}

.el-date-range-picker__content .el-date-range-picker__header div {
  color: rgba(173, 255, 44);
}

.el-picker-panel__icon-btn .el-icon{
  color: rgba(173, 255, 44) !important;
}

.el-date-range-picker .el-picker-panel__body {
  background-color: rgba(20, 19, 13);
}

.el-date-table td.in-range {
  .el-date-table-cell__text {
    color: rgba(20, 19, 13) !important;
  }
  .el-date-table-cell {
    background-color: rgba(173, 255, 44);
    margin-left: 5px;
    margin-right: 5px;
    border-radius: 5px;
    &:hover {
      background-color: rgb(176, 176, 174);
    }
  }
}

.el-date-table td.start-date .el-date-table-cell__text,
.el-date-table td.end-date .el-date-table-cell__text {
  background-color: transparent;
}

.el-date-table-cell__text {
  color: rgba(173, 255, 44) !important;
}

.el-date-table td.available .el-date-table-cell:hover {
  background-color: rgb(176, 176, 174);
  margin-left: 5px;
  margin-right: 5px;
  border-radius: 5px;
}

td.next-month, td.prev-month {
  .el-date-table-cell__text {
    color: rgb(99, 144, 26)!important;
  }
}

</style>
