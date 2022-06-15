<template>
  <p class="inline-flex pb-2">
    {{ props.numberOfRecordings.toLocaleString() }} recordings
    <icon-custom-angle-down class="ml-1 mt-1 text-xs" />
  </p>
  <div class="border-l-3 border-box-grey pl-2">
    <div class="text-subtle">
      Sites: {{ props.jobInput.sites }}
    </div>
    <div class="text-subtle">
      Time of day: {{ props.jobInput.timeOfDay }}
    </div>
    <div class="text-subtle">
      Dates: {{ props.jobInput.dateRange }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { JobInput } from '~/job'

const props = defineProps<{
  numberOfRecordings: number,
  jobInput: JobInput
}>()
</script>
