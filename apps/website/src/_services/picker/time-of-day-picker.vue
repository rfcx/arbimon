<template>
  <div class="flex inline-flex">
    <button
      type="button"
      class="h-8 px-3 text-base flex-shrink-0 rounded-md flex justify-center items-center"
      :class="selectedButton === hours.all.label ? 'bg-util-gray-01 text-pitch' : 'bg-pitch border-1 border-white text-insight'"
      @click="selectAllDay"
    >
      All Day
    </button>
    <button
      type="button"
      class="ml-3 h-8 px-3 text-base flex-shrink-0 rounded-md flex justify-center items-center"
      :class="selectedButton === hours.custom.label ? 'bg-util-gray-01 text-pitch' : 'bg-pitch border-1 border-white text-insight'"
      @click="selectCustom"
    >
      Custom
    </button>
  </div>
  <input
    v-model="hourRange"
    type="text"
    placeholder="e.g. 0-5, 7-11, 14, 15"
    class="p-2 mt-4 bg-pitch h-11 text-base border border-1 border-frequency rounded-md focus:border-frequency focus:outline-none focus:ring-0"
    :onbeforeinput="restrictInputChars"
  >
  <span
    v-if="showError"
    class="text-sm text-flamingo"
  >
    Invalid hour range. Example: for recordings between 5:00 and 9:00 and between 16:00 and 20:00, use 5-8,16-19.
  </span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { hours } from './time-of-day-constants'

const emit = defineEmits<{(e: 'emitHourRange', value: string): void}>()

const showError = ref(false)
const hourRange = ref(hours.all.value)
const selectedButton = ref(hours.all.label)

const selectAllDay = () => {
  selectedButton.value = hours.all.label
  hourRange.value = hours.all.value
}

const selectCustom = () => {
  selectedButton.value = hours.custom.label
  hourRange.value = hours.custom.value
}

watch(() => hourRange.value, (ref) => {
  showError.value = !isValidHourRange(ref)
  if (!showError.value) {
    emit('emitHourRange', ref)
  }
})

function isValidHourRange (hourRange: string): boolean {
  const hourRangeRegex = /^(\b(0?[0-9]|1[0-9]|2[0-3])\b)(((-|,)\b(0?[0-9]|1[0-9]|2[0-3])\b)?)+$/
  return hourRangeRegex.test(hourRange)
}

function restrictInputChars (e: InputEvent) {
  if (e.inputType === 'insertText' || e.inputType === 'insertFromPaste') {
    const data = e.data
    if (data !== ',' && data !== '-' && data !== '0' && !(Number(data))) {
      e.preventDefault()
    }
  }
}

</script>
