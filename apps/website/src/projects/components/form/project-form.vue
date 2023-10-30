<template>
  <div>
    <label
      for="name"
      class="block mb-2 font-medium text-gray-900 dark:text-insight"
    >Project Name*</label>
    <input
      id="name"
      v-model="name"
      name="name"
      type="text"
      class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
      placeholder="Brown bears in Eastern Finland"
      required
    >
  </div>
  <div
    id="dateRangePicker"
    date-rangepicker
    class="flex mt-4 items-center gap-4"
  >
    <div class="flex-1">
      <label
        for="start"
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project start date</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
          </svg>
        </div>
        <input
          id="datepickerId"
          datepicker
          name="start"
          type="text"
          class="pl-10 w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
          placeholder="Choose date"
          datepicker-format="mm/dd/yyyy"
        >
      </div>
    </div>
    <span class="mx-4">-</span>
    <div class="flex-1">
      <label
        for="end-date"
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project end date</label>
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
          </svg>
        </div>
        <input
          datepicker
          name="end"
          type="text"
          class="pl-10 w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
          placeholder="Choose date"
          datepicker-format="mm/dd/yyyy"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, ref, watch } from 'vue'

import type { ProjectDefault } from '../../types'

const name = ref('')
const startDate = ref('')
const endDate = ref('')

const value: ComputedRef<ProjectDefault> = computed(() => {
  return {
    name: name.value,
    startDate: startDate.value,
    endDate: endDate.value
  }
})

const emit = defineEmits<{(e: 'emitUpdateValue', value: ProjectDefault): void}>()

watch(name, () => {
  emit('emitUpdateValue', value.value)
})

watch(startDate, () => {
  emit('emitUpdateValue', value.value)
})

watch(endDate, () => {
  emit('emitUpdateValue', value.value)
})

</script>
