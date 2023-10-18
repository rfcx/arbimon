<!-- eslint-disable vue/no-unused-vars -->
<!-- eslint-disable vue/require-v-for-key -->
<template>
  <h2 class="mb-6">
    Overview
  </h2>
  <div
    v-if="loading || metrics == null"
    class="flex gap-4 columns-2 md:columns-4"
  >
    <div
      v-for="n in 4"
      class="loading-shimmer rounded-xl p-4 min-w-32 <sm:min-w-24 grow flex-1"
    >
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <p>&nbsp;</p>
    </div>
  </div>
  <div
    v-else-if="error"
    class="flex gap-4 columns-2 md:columns-4"
  >
    <template
      v-for="n in 4"
      :key="n"
    >
      <numeric-metric-error
        class="rounded-xl p-4 sm:min-w-32 min-w-24 grow flex-1"
      />
    </template>
  </div>
  <div
    v-else
    class="gap-4 <sm:text-center items-stretch grid grid-cols-2 lg:grid-cols-4"
  >
    <numeric-metric-with-icons
      tooltip-id="deployment-sites"
      tooltip-text="Number of sites with recorders deployed."
      title="Deployment sites"
      :value="metrics?.deploymentSites ?? 0"
      icon-name="ft-map-pin-lg"
      class="flex-1"
    />
    <numeric-metric-with-icons
      tooltip-id="threatened-species-over-all-species"
      title="Threatened over all species detected"
      tooltip-text="Number of Near Threatened, Vulnerable, Endangered, & Critically Endangered species over total species found."
      :value="metrics?.threatenedSpecies ?? 0"
      :total-value="metrics?.totalSpecies ?? 0"
      icon-name="ft-bird-lg"
      class="flex-1"
    />
    <numeric-metric-with-icons
      tooltip-id="total-detections"
      title="Total detections"
      tooltip-text="Total number of species calls detected."
      :value="metrics?.totalDetections ?? 0"
      icon-name="ft-search-lg"
      class="flex-1"
    />
    <numeric-metric-with-icons
      tooltip-id="total-recordings"
      tooltip-text="Total hours of recordings captured"
      title="Total recordings"
      :value="totalRecordingsValue"
      icon-name="ft-mic-lg"
      :unit="totalRecordingsUnit"
      class="flex-1"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'

import NumericMetricError from './components/numeric-metric-error.vue'
import NumericMetricWithIcons from './components/numeric-metric-with-icons.vue'

const props = defineProps<{ loading: boolean, error: boolean, metrics: DashboardMetricsResponse | undefined }>()

// form the total recordings value (minutes or hours)
const totalRecordingsMin = computed(() => props.metrics?.totalRecordings ?? 0)
const MAXIMUM_MINUTE = 3 * 60 // 3 hours
const totalRecordingsUnit = computed(() => totalRecordingsMin.value < MAXIMUM_MINUTE ? 'minutes' : 'hours')
const totalRecordingsValue = computed(() => {
  return totalRecordingsMin.value < MAXIMUM_MINUTE ? totalRecordingsMin.value : totalRecordingsMin.value / 60
})
</script>
