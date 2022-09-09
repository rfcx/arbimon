<template>
  <div class="job-result-validation-status-wrapper">
    <h3 class="job-result-validation-status-header text-subtle text-sm mb-2">
      Validation status
    </h3>
    <div class="grid grid-cols-6 gap-2">
      <template
        v-for="item in details"
        :key="'validation-status-' + item.label"
      >
        <span class="font-semibold col-span-1 <md:col-span-1 <lg:col-span-2">{{ displayValue(item.value) }}</span>
        <span class="ml-2 col-span-5 <md:col-span-5 <lg:col-span-4">{{ item.label }}</span>
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
