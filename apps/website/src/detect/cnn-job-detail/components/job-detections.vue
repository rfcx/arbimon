<template>
  <div class="border-1 border-util-gray-01 rounded-md mt-6">
    <div class="p-6">
      <h1 class="flex text-insight">
        Detections
      </h1>
      <div
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
            class="search-input text-insight shadow-lg shadow-frequency/10"
            placeholder="Search for species, sounds..."
            @input="searchKeywordChange()"
            @focus="isSearchBoxFocused = true"
            @blur="isSearchBoxFocused = false"
          >
        </div>
      </div>
      <cnn-job-species-detected
        :datasets="results"
        :loading="isLoading"
        :total="total"
        :index="pageNo"
        @emit-sort-paginations="onEmitSortAndPaginations"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { ClassificationsSummaryDataset } from './job-detection-list.vue'
import CnnJobSpeciesDetected from './job-detection-list.vue'

withDefaults(defineProps<{ isLoading: boolean, total: number, results: ClassificationsSummaryDataset[] }>(), {
  isLoading: true
})

const searchSpeciesKeyword = ref('')
const isSearchBoxFocused = ref(false)
const sortKeyLabel = ref<string| undefined>()
const pageNo = ref(1)

const emit = defineEmits<{(e: 'emitSearch', keyword: string): void, (e: 'emitSortPaginations', sortKey?: string, pageIndex?: number): void }>()

const searchKeywordChange = async () => {
  pageNo.value = 1
  emit('emitSearch', searchSpeciesKeyword.value)
}

const onEmitSortAndPaginations = async (sortKey?: string, pageIndex?: number) => {
  sortKeyLabel.value = sortKey
  pageNo.value = pageIndex ?? 1
  emit('emitSortPaginations', sortKey, pageIndex)
}

</script>

<style scoped lang="scss">
#searchSpeciesInput {
  padding-inline-start: 2rem;
}
</style>
