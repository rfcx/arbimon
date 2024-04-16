<template>
  <div class="job-result-validation-status-wrapper mt-4">
    <div
      v-if="props.isLoading"
      class="m-2 loading-shimmer w-full rounded-lg py-15 max-w-64"
    />
    <ComponentError
      v-else-if="props.isError"
      class="mx-2"
    />
    <div
      v-else
      id="job-result-validation-status-grid-table"
      class="grid gap-x-4 gap-y-2 text-base text-insight"
    >
      <template
        v-for="key in validationStatusData"
        :key="'validation-status-' + key[0]"
      >
        <div class="grid grid-cols-4">
          <span>{{ key[0] }}</span>
          <span class="flex items-center justify-center">{{ key[1] }}</span>
          <span class="flex items-center justify-center">{{ getValidationPercentage(key[1], totalDetection) }}%</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import numeral from 'numeral'
import { computed } from 'vue'

import { type ValidationStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import ComponentError from './component-error.vue'

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: ValidationStatus | undefined }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const validationStatusData = computed(() => {
  return Object.entries(props.data ?? {}).filter(([key]) => key !== 'total').map(([key, value]) => [validationStatusName(key), value])
})

const validationStatusName = (key: string): string => {
  const validationStatusMap: Record<string, string> = {
    notPresent: 'Not Present',
    unknown: 'Unknown',
    present: 'Present',
    unvalidated: 'Unvalidated'
  }
  return validationStatusMap[key]
}

const totalDetection = computed(() => {
  const value = props.data
  return (value?.notPresent ?? 0) + (value?.present ?? 0) + (value?.unknown ?? 0) + (value?.unvalidated ?? 0)
})

const getValidationPercentage = (x: number, total: number): string => {
   return numeral(total === 0 ? 0 : x / total * 100).format('0,0', Math.floor)
}

</script>
