<template>
  <div
    class="flex flex-col px-6 py-4 mt-4 border-b-1 border-util-gray-03"
  >
    <div class="flex flex-wrap flex-wrap gap-2 items-center justify-start text-insight text-base font-medium lg:flex-row lg:justify-between">
      <h4>Validation status</h4>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-unvalidated class="h-4 w-4" />
          <span>Unvalidated:</span>
        </div>
        <status-number
          :is-loading="isLoading"
          :value="unvalidated"
        />
      </div>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-present class="h-4 w-4" />
          <span>Present:</span>
        </div>
        <status-number
          :is-loading="isLoading"
          :value="confirmed"
        />
      </div>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-not-present class="h-4 w-4" />
          <span>Not present:</span>
        </div>
        <status-number
          :is-loading="isLoading"
          :value="rejected"
        />
      </div>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-unknown class="h-4 w-4" />
          <span>Unknown:</span>
        </div>
        <status-number
          :is-loading="isLoading"
          :value="uncertain"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusNumber from './job-validation-status-number.vue'

defineProps<{
  isLoading: boolean
  unvalidated: number
  rejected: number
  uncertain: number
  confirmed: number
}>()
</script>
