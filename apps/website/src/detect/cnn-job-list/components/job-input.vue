<template>
  <p class="inline-flex pb-2">
    {{ totalDurationMinutes }}
  </p>
  <div class="border-l-3 border-box-gray pl-2 text-subtle">
    <p>Sites: {{ props.jobInput.sites }}</p>
    <p>Date: {{ props.jobInput.dateRange }}</p>
    <p>Time: {{ props.jobInput.timeOfDay }}</p>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

import type { JobInput } from '../../types'

const props = defineProps<{
  totalDurationMinutes: number,
  jobInput: JobInput
}>()

const totalDurationMinutes = computed(() => {
  const totalDurationMinutesString = props.totalDurationMinutes > 0 ? props.totalDurationMinutes.toLocaleString() : '~'
  return `${totalDurationMinutesString} minutes of recordings`
})
</script>
