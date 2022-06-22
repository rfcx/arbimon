<template>
  <el-date-picker
    id="date-range-input"
    v-model="dateValues"
    :default-value="[props.initialDateStartLocal, props.initialDateEndLocal]"
    type="daterange"
    unlink-panels
    range-separator="to"
    size="large"
  />
  <!-- :shortcuts="dateShortcuts" -->
</template>

<script setup lang="ts">
import { Dayjs } from 'dayjs'
import { onMounted, ref, watch } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

// Interface
const emit = defineEmits<{(e: 'emitSelectDateRange', value: [Dayjs, Dayjs]): void}>()
const props = withDefaults(defineProps<{
  initialDateStartLocal?: Date,
  initialDateEndLocal?: Date
}>(), {
  initialDateStartLocal: () => dayjs().subtract(20, 'years').toDate(),
  initialDateEndLocal: () => dayjs().toDate()
})

const dateValues = ref<[Date, Date]>([props.initialDateStartLocal, props.initialDateEndLocal])
watch(dateValues, () => {
  emitSelectDateRange(dateValues.value)
})

// change date ranges when the initial dates are changed (project filter)
watch(() => [props.initialDateStartLocal, props.initialDateEndLocal], ([dateStartLocal, dateEndLocal]) => {
  dateValues.value = [dateStartLocal, dateEndLocal]
})

const emitSelectDateRange = (dateRange: [Date, Date]): void => {
  const dateStart = dayjs(dateRange[0].toDateString())
  const dateEnd = dayjs(dateRange[1].toDateString())
  emit('emitSelectDateRange', [dateStart, dateEnd])
}

// Mock emit
onMounted(() => emitSelectDateRange(dateValues.value))
</script>
