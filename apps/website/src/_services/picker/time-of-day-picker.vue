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
    onkeypress="return event.charCode === 44 || event.charCode === 45 || (event.charCode > 47 && event.charCode < 58);"
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
  isValid.value = !validate(hourRange)
})

const validate = (hourRange: string): boolean => {
  let isValidate = false

  if (hourRange.includes(',')) {
    const hourItems = hourRange.split(',')
    if (hourItems[0] === '' || hourItems[hourItems.length - 1] === '') {
      isValidate = false
    } else {
        hourItems.forEach(h => {
        if (h.includes('-')) {
          const hour = h.split('-')
          if (hour[0] === '' || hour[1] === '') {
            isValidate = false
          } else if (Number(hour[0]) < 24 && Number(hour[1]) < 24) {
            isValidate = true
          } else {
            isValidate = false
          }
        } else {
          isValidate = Number(h) < 24
        }
      })
    }
  } else {
    if (hourRange.includes('-')) {
        const hour = hourRange.split('-')
        if (hour[0] === '' || hour[1] === '') {
          isValidate = false
        } else if (Number(hour[0]) < 24 && Number(hour[1]) < 24) {
          isValidate = true
        } else {
          isValidate = false
        }
      } else {
        isValidate = Number(hourRange) < 24
      }
    }
  return isValidate
}

</script>
