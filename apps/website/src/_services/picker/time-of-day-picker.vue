<template>
  <div class="flex inline-flex">
    <button
      type="button"
      class="h-8 px-3 text-base flex-shrink-0 rounded-md flex justify-center items-center"
      :class="selectedTime.selectedTimeType === 'All day' ? 'bg-util-gray-01 text-black' : 'bg-pitch border-1 border-white text-white'"
      @click="selectAllDay"
    >
      All Day
    </button>
    <button
      type="button"
      class="ml-3 h-8 px-3 text-base flex-shrink-0 rounded-md flex justify-center items-center"
      :class="selectedTime.selectedTimeType === 'All day' ? 'bg-pitch border-1 border-white text-white' : 'bg-util-gray-01 text-black'"
      @click="selectCustom"
    >
      Custom
    </button>
  </div>
  <input
    v-model="selectedTime.selectedHourRangeLabel"
    type="text"
    placeholder="e.g. 0-5, 7-11, 14, 15"
    class="p-2 mt-4 bg-pitch text-base w-full border border-1 border-frequency rounded-md focus:border-frequency focus:outline-none focus:ring-0"
    @input="$emit('emitSelectTime', selectedTime.selectedHourRangeLabel)"
  >
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'

import { hours } from './time-of-day-constants'

const emit = defineEmits<{(e: 'emitSelectTime', value: string): void}>()

const selectedTime = reactive({
  selectedTimeType: hours.all.label,
  selectedHourRange: hours.all.value,
  selectedHourRangeLabel: '00:00-23:00'
})

onMounted(() => {
  emit('emitSelectTime', selectedTime.selectedHourRange)
})

const selectAllDay = () => {
  selectedTime.selectedTimeType = 'All day'
  selectedTime.selectedHourRange = '0-23'
  selectedTime.selectedHourRangeLabel = '00:00-23:00'
  emit('emitSelectTime', selectedTime.selectedHourRange)
}

const selectCustom = () => {
  selectedTime.selectedTimeType = 'Custom'
  selectedTime.selectedHourRange = ''
  selectedTime.selectedHourRangeLabel = ''
  emit('emitSelectTime', selectedTime.selectedHourRange)
}

watch(() => selectedTime.selectedHourRangeLabel, (hourRange) => {
  selectedTime.selectedTimeType = hourRange === '0-23' ? 'All day' : 'Custom'
})
</script>
