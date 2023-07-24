<template>
  <div class="job-result-validation-status-wrapper">
    <h3 class="job-result-validation-status-header text-subtle text-sm mb-2">
      Validation status
    </h3>
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
      class="grid gap-x-4"
      style="grid-template-columns: fit-content(100px) 1fr;"
    >
      <template
        v-for="key in Object.entries(props.data?.reviewStatus ?? {})"
        :key="'validation-status-' + key[0]"
      >
        <span class="font-semibold justify-self-start text-right text-lg">{{ validationStatusValue(key[0], key[1]) }}</span>
        <span class="text-lg">{{ validationStatusName(key[0]) }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'

import { type DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'

import ComponentError from './component-error.vue'

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: DetectValidationResultsResponse | undefined }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

/**
 * Returns `unreviewed` amount instead of total from
 *
 * `total` - (`uncertain` + `confirmed` + `rejected`)
 */
const validationStatusValue = (key: string, value: number): number => {
  if (key === 'total') {
    const sum = (props.data?.reviewStatus.uncertain ?? 0) + (props.data?.reviewStatus.confirmed ?? 0) + (props.data?.reviewStatus.rejected ?? 0)
    return (props.data?.reviewStatus.total ?? 0) - sum
  }

  return value
}

const validationStatusName = (key: string): string => {
  if (key === 'total') {
    return 'Unreviewed'
  }

  return validationStatusMap.value[key]
}

const validationStatusMap: Ref<Record<string, string>> = ref({
  rejected: 'Not Present',
  uncertain: 'Unknown',
  confirmed: 'Present',
  total: 'Total'
})
</script>
