<template>
  <div class="job-result-validation-status-wrapper">
    <span class="job-result-validation-status-header text-subtle text-sm">Validation status</span>
    <div class="job-result-validation-status-detail mt-2 grid grid-cols-4 gap-2">
      <template
        v-for="item in details"
        :key="'validation-status-' + item.label"
      >
        <div class="col-span-1 justify-self-end">
          {{ displayValue(item.value) }}
        </div>
        <div class="col-span-3">
          {{ item.label }}
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { displayValue } from '@rfcx-bio/utils/number'

const details = [
  {
    label: 'Unvalidated',
    value: 200_000
  },
  {
    label: 'Present',
    value: 15000000
  },
  {
    label: 'Not present',
    value: 12345
  },
  {
    label: 'Unknown',
    value: 0
  }
]

</script>
