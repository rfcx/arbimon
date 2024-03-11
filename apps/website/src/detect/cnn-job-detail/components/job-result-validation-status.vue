<template>
  <div class="job-result-validation-status-wrapper mt-4">
    <div
      v-if="props.isLoading"
      class="loading-shimmer ml-2 mr-10 rounded-lg h-8"
    />
    <ComponentError
      v-else-if="props.isError"
      class="py-8"
    />
    <div
      v-else
      id="job-result-validation-status-grid-table"
      class="grid gap-x-4 gap-y-2 text-base text-insight"
    >
      <template
        v-for="key in Object.entries(props.data?.reviewStatus ?? {})"
        :key="'validation-status-' + key[0]"
      >
        <div class="grid grid-cols-4">
          <span>{{ validationStatusName(key[0]) }}</span>
          <span class="flex items-center justify-center">{{ validationStatusValue(key[0], key[1]) }}</span>
          <span class="flex items-center justify-center">{{ getValidationPercentage(key[1], totalDetection) }}%</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import numeral from 'numeral'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'

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

const totalDetection = computed(() => {
  const value = props.data?.reviewStatus
  return (value?.confirmed ?? 0) + (value?.rejected ?? 0) + (value?.total ?? 0) + (value?.uncertain ?? 0)
})

const getValidationPercentage = (x: number, total: number): string => {
   return numeral(total === 0 ? 0 : x / total * 100).format('0,0')
}

</script>
