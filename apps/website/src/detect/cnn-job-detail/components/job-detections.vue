<template>
  <div class="border-1 border-util-gray-01 rounded-md mt-6">
    <div class="p-6">
      <h1 class="flex text-insight">
        Detections
      </h1>
      <form
        class="h-12 w-72 my-6"
      >
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <span class="p-2">
              <icon-custom-ic-search
                class="w-5 h-5 text-insight stroke-insight"
                storke="white"
              />
            </span>
          </div>
          <input
            id="searchSpeciesInput"
            v-model="searchSpeciesKeyword"
            name="search"
            type="text"
            class="input-field text-insight shadow-lg shadow-frequency/10"
            placeholder="Search for species, sounds..."
            @input="$emit('emitSearch', searchSpeciesKeyword)"
            @focus="isSearchBoxFocused = true"
            @blur="isSearchBoxFocused = false"
          >
        </div>
      </form>
      <cnn-job-species-detected
        :datasets="results"
        :loading="isLoading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { type DetectDetectionsResponse } from '@rfcx-bio/common/api-bio/detect/detect-detections'

import type { ClassificationsSummaryDataset } from './cnn-job-species-detected.vue'
import CnnJobSpeciesDetected from './cnn-job-species-detected.vue'

withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: DetectDetectionsResponse | undefined, results: ClassificationsSummaryDataset[] }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const searchSpeciesKeyword = ref('')
const isSearchBoxFocused = ref(false)

defineEmits<{(e: 'emitSearch', keyword: string): void }>()

</script>

<style scoped lang="scss">
#searchSpeciesInput {
  padding-inline-start: 2rem;
}
</style>
