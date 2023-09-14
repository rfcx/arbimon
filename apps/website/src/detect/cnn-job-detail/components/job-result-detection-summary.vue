<template>
  <div
    v-if="props.isLoading"
    class="loading-shimmer mx-2 rounded-lg"
  />
  <ComponentError
    v-else-if="props.isError"
    class="py-8"
  />
  <div
    v-else
    class="job-result-detection-summary-wrapper"
  >
    <h3 class="job-result-detection-summary-header text-subtle text-sm mb-2">
      Detection summary
    </h3>
    <div class="job-result-detection-summary-detail mt-2 grid grid-rows-5 gap-x-4">
      <template
        v-for="(item, index) in classificationsSummary()"
        :key="`job-result-detection-summary-species-${item.value}-${index}`"
      >
        <div class="justify-self-start font-semibold text-right text-lg">
          {{ displayValue(item.total) }}
        </div>
        <router-link
          class="truncate text-lg"
          :title="item.value"
          :to="{ name: ROUTE_NAMES.cnnJobDetailBySpecies, params: { jobId, speciesSlug: item.value }}"
        >
          {{ item.title }} ({{ item.value }})
        </router-link>
      </template>
    </div>
    <div
      v-if="(data?.classificationsSummary.length ?? 0) > displayItemNumber"
      class="flex justify-end items-center mt-2"
    >
      <button
        class="btn btn-icon ml-4"
        :disabled="page === 1"
        @click="previousPage()"
      >
        <icon-fas-chevron-left class="w-3 h-3" />
      </button>
      <button
        class="btn btn-icon ml-2"
        :disabled="classificationsSummary().length < displayItemNumber"
        @click="nextPage()"
      >
        <icon-fas-chevron-right class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import type { DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'
import { displayValue } from '@rfcx-bio/utils/number'

import { ROUTE_NAMES } from '~/router'
import ComponentError from './component-error.vue'

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: DetectValidationResultsResponse | undefined }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const displayItemNumber = 10
const page = ref(1)

const route = useRoute()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

const classificationsSummary = () => {
  if (props.data != null) {
    return props.data.classificationsSummary
      .slice((page.value - 1) * displayItemNumber, page.value * displayItemNumber)
  }

  return []
}

const previousPage = () => {
  page.value -= 1
}

const nextPage = () => {
  page.value += 1
}
</script>

<style lang="scss">
div.job-result-detection-summary-detail {
  grid-template-columns: fit-content(4rem) 1fr fit-content(4rem) 1fr;
}
</style>
