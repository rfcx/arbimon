<template>
  <div class="job-result-validation-status-wrapper">
    <h3 class="job-result-validation-status-header text-subtle text-sm mb-2">
      Validation status
    </h3>
    <div v-if="props.isLoading" />
    <div v-else-if="props.isError" />
    <div v-else-if="!props.summary" />
    <div
      v-else
      class="grid grid-cols-6 gap-2"
    >
      <template
        v-for="key in Object.keys(props.summary).map(Number)"
        :key="'validation-status-' + key"
      >
        <span class="font-semibold col-span-1 <md:col-span-1 <lg:col-span-2">{{ displayValue(props.summary[key]) }}</span>
        <span class="ml-2 col-span-5 <md:col-span-5 <lg:col-span-4">{{ getValidationStatusLabel(key) }}</span>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">

import { SpeciesValidationSummary } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { displayValue } from '@rfcx-bio/utils/number'

import { VALIDATION_STATUS_BY_ID } from '~/validation'

const props = withDefaults(defineProps<{
  isLoading: boolean,
  isError: boolean,
  summary: SpeciesValidationSummary | null
}>(), {
  isLoading: false,
  isError: false,
  summary: null
})

const getValidationStatusLabel = (key: number) => {
  return VALIDATION_STATUS_BY_ID[key].label
}
</script>
