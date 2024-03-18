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
        v-for="key in Object.entries(props.data ?? {})"
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

import { type ValidationStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import ComponentError from './component-error.vue'

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: ValidationStatus | undefined }>(), {
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
  return value
}

const validationStatusName = (key: string): string => {
  if (key === 'total') {
    return 'Unreviewed'
  }
console.info(key)
  return validationStatusMap.value[key]
}

const validationStatusMap: Ref<Record<string, string>> = ref({
  notPresent: 'Not Present',
  unknown: 'Unknown',
  present: 'Present',
  unvalidated: 'Unvalidated'
})

const totalDetection = computed(() => {
  const value = props.data
  return (value?.notPresent ?? 0) + (value?.present ?? 0) + (value?.unknown ?? 0) + (value?.unvalidated ?? 0)
})

const getValidationPercentage = (x: number, total: number): string => {
   return numeral(total === 0 ? 0 : x / total * 100).format('0,0')
}

</script>
