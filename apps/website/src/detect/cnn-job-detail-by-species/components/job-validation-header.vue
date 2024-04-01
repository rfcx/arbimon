<template>
  <div>
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
        <span class="text-2xl font-display">Filters:</span>
        <JobValidationFilters
          @emit-min-confidence="toggleMinConfidence"
        />
        <div>
          <span>Results:</span>
          <span class="ml-1">{{ filteredResult }}</span>
        </div>
      </div>
    </div>
    <div
      v-if="isMinConfidenceOpen"
      class="flex flex-row items-center gap-x-2 pt-3"
    >
      <span class="text-sm">Minimum Confidence:</span>
      <input
        id="minConfidenceCnn"
        v-model.number="currentValue"
        type="number"
        min="0"
        max="1"
        class="w-12 text-center text-sm text-pitch bg-util-gray-01 rounded-md outline-none focus:(outline-none ring-util-gray-01) px-1 py-0.5 mr-1 input-hide-arrows"
        @change="onValueChange(currentValue)"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import JobValidationFilters from './job-validation-filters.vue'

withDefaults(defineProps<{ speciesName: string | undefined, detectionsCount: number | undefined, filteredResult: number | undefined }>(), {
  speciesName: undefined,
  detectionsCount: undefined
})

const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()

const isMinConfidenceOpen = ref<boolean>(false)
 const currentValue = ref<number>(detectionsResultFilterBySpeciesStore.filter.minConfidence)

const toggleMinConfidence = (isSelected: boolean) => {
  isMinConfidenceOpen.value = isSelected
}

const onValueChange = (value: number) => {
  if (value < 0 || value > 1) {
    currentValue.value = detectionsResultFilterBySpeciesStore.filter.minConfidence
    return
  }
  detectionsResultFilterBySpeciesStore.filter.minConfidence = value
}
</script>
<style lang="scss" scoped>
/* Chrome, Safari, Edge, Opera */
.input-hide-arrows::-webkit-outer-spin-button,
.input-hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-hide-arrows {
  /* Firefox */
  -moz-appearance: textfield;
}
</style>
