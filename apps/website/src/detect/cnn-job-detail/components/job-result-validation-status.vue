<template>
  <div class="job-result-validation-status-wrapper">
    <h3 class="job-result-validation-status-header text-subtle text-sm mb-2">
      Validation status
    </h3>
    <div v-if="isLoadingValidationStatus" />
    <div v-else-if="isErrorValidationStatus" />
    <div v-else-if="!validationStatusData" />
    <div
      v-else
      class="grid grid-cols-6 gap-2"
    >
      <template
        v-for="key in Object.keys(validationStatusData).map(Number)"
        :key="'validation-status-' + key"
      >
        <span class="font-semibold col-span-1 <md:col-span-1 <lg:col-span-2">{{ getValidationStatusValue(key) }}</span>
        <span class="ml-2 col-span-5 <md:col-span-5 <lg:col-span-4">{{ getValidationStatusLabel(key) }}</span>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
  import type { AxiosInstance } from 'axios'
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'

import { displayValue } from '@rfcx-bio/utils/number'

import { useGetValidationStatus } from '@/detect/_composables/use-get-validation-status'
import { apiClientBioKey } from '@/globals'
import { VALIDATION_STATUS_BY_ID } from '~/validation'

const route = useRoute()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

// External data
const apiBio = inject(apiClientBioKey) as AxiosInstance
const { isLoading: isLoadingValidationStatus, isError: isErrorValidationStatus, data: validationStatusData } = useGetValidationStatus(apiBio, jobId.value)

const getValidationStatusLabel = (key: number) => VALIDATION_STATUS_BY_ID[key].label

const getValidationStatusValue = (key: number) => {
  const validKey = key as unknown as 0 | 1 | 2 | 3
  return validationStatusData.value ? displayValue(validationStatusData.value[validKey]) : 0
}
</script>
