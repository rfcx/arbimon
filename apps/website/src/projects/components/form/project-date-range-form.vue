<template>
  <div
    id="dateRangePicker"
    class="flex mt-6 items-center gap-4 md:flex-row"
  >
    <div class="flex-1">
      <label
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project start date</label>
      <div class="relative flex-1">
        <el-date-picker
          v-model="dateStart"
          class="w-full border text-fog border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
          type="date"
          :disabled="isDisabled"
          placeholder="Choose date"
          format="DD/MM/YYYY"
          :disabled-date="disabledStartDateRange"
        />
      </div>
    </div>
    <span class="mt-7 hidden md:block">-</span>
    <div class="flex-1">
      <label
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project end date</label>
      <div
        class="relative flex-1"
        :class="{'not-allowed': onGoing}"
      >
        <el-date-picker
          v-model="dateEnd"
          class="w-full border text-fog border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
          type="date"
          :disabled="isDisabled || onGoing"
          placeholder="Choose date"
          format="DD/MM/YYYY"
          :disabled-date="disabledEndDateRange"
        />
      </div>
    </div>
  </div>
  <div class="items-center mt-4">
    <input
      id="project-settings-on-going-project-checkbox"
      type="checkbox"
      class="w-5 h-5 border-2 mb-1 rounded dark:bg-echo focus:ring-frequency border-white dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
      :disabled="isDisabled"
      :checked="onGoing"
      @click="onSelectOnGoing()"
    >
    <label
      class="font-light ml-2 cursor-pointer"
      @click="onSelectOnGoing()"
    >This is an on-going project</label>
  </div>
</template>

<script setup lang="ts">
import type { DateRange } from '_services/picker/date-range-picker-interface'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  initialDateStart?: Date,
  initialDateEnd?: Date,
  onGoing?: boolean,
  isDisabled?: boolean
}>()

const emit = defineEmits<{(e: 'emitSelectDateRange', value: DateRange & {onGoing: boolean }): void}>()

const dateLocalIso = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD') + 'T00:00:00.000Z'
}

const dateStart = ref<string>(props.initialDateStart !== undefined ? dateLocalIso(props.initialDateStart) : '')
const dateEnd = ref<string>(props.initialDateEnd !== undefined ? dateLocalIso(props.initialDateEnd) : '')
const onGoing = ref<boolean>(props.onGoing || false)

const value = computed(() => {
  const isValidDate = (date: string) => date !== '' && date !== null && new Date(date).toString() !== 'Invalid Date'
  return {
    dateStartLocalIso: isValidDate(dateStart.value) ? dateLocalIso(new Date(dateStart.value)) : '',
    dateEndLocalIso: isValidDate(dateEnd.value) ? dateLocalIso(new Date(dateEnd.value)) : '',
    onGoing: onGoing.value
  }
})

const disabledStartDateRange = (time: Date) => {
  if (dateEnd.value) {
    return time.getTime() > new Date(dateEnd.value).getTime()
  }

  if (time.getTime() > Date.now()) {
    return true
  }

  return false
}

const disabledEndDateRange = (time: Date) => {
  if (dateStart.value) {
    return time.getTime() < new Date(dateStart.value).getTime()
  }
  return false
}

const onSelectOnGoing = () => {
  onGoing.value = !onGoing.value
  //
  if (onGoing.value) { dateEnd.value = '' }
}

watch(() => props.initialDateEnd, (newValue, oldValue) => {
  if (newValue?.toDateString() === oldValue?.toDateString()) return
  dateEnd.value = newValue !== undefined ? dateLocalIso(newValue) : ''
})

watch(() => props.initialDateStart, (newValue, oldValue) => {
  if (newValue?.toDateString() === oldValue?.toDateString()) return
  dateStart.value = newValue !== undefined ? dateLocalIso(newValue) : ''
})

watch(() => props.onGoing, (newValue) => {
  onGoing.value = newValue
})

watch(() => value.value, (newValue) => {
  emit('emitSelectDateRange', newValue)
})

</script>
