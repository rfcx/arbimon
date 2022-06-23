<template>
  <p class="inline-flex pb-2">
    {{ numberOfRecordings }}
  </p>
  <div class="border-l-3 border-box-grey pl-2 text-subtle">
    <p>Sites: {{ props.jobInput.sites }}</p>
    <p>Date: {{ props.jobInput.dateRange }}</p>
    <p>Time: {{ props.jobInput.timeOfDay }}</p>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

import { JobInput } from '../../types'

const props = defineProps<{
  numberOfRecordings: number,
  jobInput: JobInput
}>()

const numberOfRecordings = computed(() => {
  const numOfRecordingsString = props.numberOfRecordings > 0 ? props.numberOfRecordings.toLocaleString() : '~'
  return `${numOfRecordingsString} recordings`
})
</script>
