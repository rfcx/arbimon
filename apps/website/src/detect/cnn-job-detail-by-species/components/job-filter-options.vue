<template>
  <div class="job-filter-options mt-4">
    <section-title>
      <template #title>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">
            {{ speciesName || '' }} ({{ speciesCount ?? 0 }})
          </h2>
        </div>
      </template>
      <template #controls>
        <JobResultFilterBySpecies />
      </template>
    </section-title>
  </div>
</template>

<script setup lang="ts">
import JobResultFilterBySpecies from './job-result-filter-by-species.vue'

withDefaults(defineProps<{ speciesName: string | undefined, speciesCount: number | undefined }>(), {
  speciesName: undefined,
  speciesCount: undefined
})
</script>
