<template>
  <div class="flex inline-flex">
    <button
      type="button"
      class="h-8 px-3 text-base flex-shrink-0 rounded-md flex justify-center items-center"
      :class="selectedTime.selectedTimeType === hours.all.label ? 'bg-util-gray-01 text-pitch' : 'bg-pitch border-1 border-white text-insight'"
      @click="selectAllDay"
    >
      All Day
    </button>
    <button
      type="button"
      class="ml-3 h-8 px-3 text-base flex-shrink-0 rounded-md flex justify-center items-center"
      :class="selectedTime.selectedTimeType === hours.custom.label ? 'bg-util-gray-01 text-pitch' : 'bg-pitch border-1 border-white text-insight'"
      @click="selectCustom"
    >
      Custom
    </button>
  </div>
  <input
    v-model="selectedTime.selectedHourRange"
    type="text"
    placeholder="e.g. 0-5, 7-11, 14, 15"
    class="p-2 mt-4 bg-pitch text-base w-full border border-1 border-frequency rounded-md focus:border-frequency focus:outline-none focus:ring-0"
    @input="$emit('emitSelectTime', selectedTime.selectedHourRange)"
  >
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'

import { hours } from './time-of-day-constants'

const emit = defineEmits<{(e: 'emitSelectTime', value: string): void}>()

const selectedTime = reactive({
  selectedTimeType: hours.all.label,
  selectedHourRange: hours.all.value
})

onMounted(() => {
  emit('emitSelectTime', selectedTime.selectedHourRange)
})

const selectAllDay = () => {
  selectedTime.selectedTimeType = hours.all.label
  selectedTime.selectedHourRange = hours.all.value
  emit('emitSelectTime', selectedTime.selectedHourRange)
}

const selectCustom = () => {
  selectedTime.selectedTimeType = hours.custom.label
  selectedTime.selectedHourRange = hours.custom.value
  emit('emitSelectTime', selectedTime.selectedHourRange)
}

watch(() => selectedTime.selectedHourRange, (hourRange) => {
  selectedTime.selectedTimeType = hourRange === '0-23' ? hours.all.label : hours.custom.label
})
</script>
