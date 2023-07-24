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
      class="grid grid-cols-6 gap-2"
    >
      <template
        v-for="key in Object.entries(props.data?.reviewStatus ?? {})"
        :key="'validation-status-' + key[0]"
      >
        <span class="font-semibold col-span-2">{{ validationStatusMap[key[0]] }}</span>
        <span class="ml-2 col-span-4">{{ key[1] }}</span>
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

const validationStatusMap: Ref<Record<string, string>> = ref({
  rejected: 'Not Present',
  uncertain: 'Unknown',
  confirmed: 'Present',
  total: 'Total'
})
</script>
