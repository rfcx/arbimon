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
    id="timeOfDayInput"
    v-model="selectedTime.selectedHourRange"
    type="text"
    placeholder="e.g. 0-5, 7-11, 14, 15"
    class="p-2 mt-4 bg-pitch h-11 text-base w-full border border-1 border-frequency rounded-md focus:border-frequency focus:outline-none focus:ring-0"
    @input="$emit('emitSelectTime', selectedTime.selectedHourRange)"
  >
  <span
    v-if="isValid"
    class="text-sm text-flamingo"
  >
    Invalid hour range. Example: for recordings between 5:00 and 9:00 and between 16:00 and 20:00, use 5-8,16-19.
  </span>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'

import { hours } from './time-of-day-constants'

const emit = defineEmits<{(e: 'emitSelectTime', value: string): void}>()
const isValid = ref(false)

const selectedTime = reactive({
  selectedTimeType: hours.all.label,
  selectedHourRange: hours.all.value
})

const setOnKeyPress = () => {
  const timeOfDayInput = document.querySelector('#timeOfDayInput')
  if (timeOfDayInput === null) return
  timeOfDayInput.addEventListener('keypress', (e) => {
    const event = e as KeyboardEvent
    if (event.keyCode !== 44 && event.keyCode !== 45 && !(event.charCode > 47 && event.charCode < 58)) {
        if (!parseInt(String.fromCharCode(event.which))) {
            event.preventDefault()
        }
    }
  })
}

onMounted(() => {
  emit('emitSelectTime', selectedTime.selectedHourRange)
  setOnKeyPress()
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
  isValid.value = !validate(hourRange)
})

const validate = (hourRange: string): boolean => {
  const regexpassword = /^(\b(0?[0-9]|1[0-9]|2[0-3])\b)(((-|,)\b(0?[0-9]|1[0-9]|2[0-3])\b)?)+$/
  return regexpassword.test(hourRange)
}

</script>
