<template>
  <div class="pt-24 mx-auto max-w-screen-xl">
    <div class="flex flex-row items-center">
      <h1>Validation</h1>
    </div>
    <div class="flex items-center font-sm space-x-1 md:space-x-2 rtl:space-x-reverse text-insight pt-6">
      <span class="font-display">Class:</span>
      <span class="italic">
        {{ speciesName || '' }}
      </span>
    </div>
    <div class="flex items-center font-sm space-x-1 md:space-x-2 rtl:space-x-reverse text-insight pt-3">
      <span class="font-display">Total detections:</span>
      <span>{{ detectionsCount }}</span>
    </div>
    <div class="flex items-center gap-x-3 text-insight pt-10">
      <span class="font-display">Filters:</span>
      <JobResultFilterBySpecies />
    </div>
  </div>
</template>

<script setup lang="ts">
import JobResultFilterBySpecies from './job-result-filter-by-species.vue'

withDefaults(defineProps<{ speciesName: string | undefined, detectionsCount: number | undefined }>(), {
  speciesName: undefined,
  detectionsCount: undefined
})
</script>
