<!-- eslint-disable vue/no-unused-vars -->
<!-- eslint-disable vue/require-v-for-key -->
<template>
  <h1 class="mb-6">
    Overview
  </h1>
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
    v-else
    class="gap-4 columns-2 lg:columns-4 <sm:text-center items-stretch flex"
  >
    <numeric-metric
      title="Deployment sites"
      :value="metrics?.deploymentSites ?? 0"
      unit="sites"
      class="flex-1"
    />
    <numeric-metric
      title="Threatened species over all species"
      :value="metrics?.threatenedSpecies ?? 0"
      :total-value="metrics?.totalSpecies ?? 0"
      class="flex-1"
    />
    <numeric-metric
      title="Total detections"
      :value="metrics?.totalDetections ?? 0"
      class="flex-1"
    />
    <numeric-metric
      title="Total recordings"
      :value="metrics?.totalRecordings == null ? 0 : metrics.totalRecordings / 60"
      unit="hours"
      class="flex-1"
    />
  </div>
</template>

<script setup lang="ts">
import type { DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'

import NumericMetric from '@/_components/numeric-metric.vue'

defineProps<{ loading: boolean, error: boolean, metrics: DashboardMetricsResponse | undefined }>()
</script>
