<!-- eslint-disable vue/no-unused-vars -->
<!-- eslint-disable vue/require-v-for-key -->
<template>
  <h1 class="mb-6">
    Overview
  </h1>
  <div
    v-if="loading || metrics === null"
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
      title="Area monitored"
      :value="areaMonitored"
      unit="sq km"
      class="flex-1"
    />
    <numeric-metric
      title="Threatened species detected"
      :value="metrics.speciesThreatenedCount"
      tooltip-text="Scientific term: test"
      class="flex-1"
    />
    <numeric-metric
      title="Recorders deployed"
      :value="metrics.siteCount"
      class="flex-1"
    />
    <numeric-metric
      title="Sampling duration"
      :value="samplingDuration"
      unit="days"
      class="flex-1"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

const props = defineProps<{ loading: boolean; metrics: {
  detectionMinutesCount: number
  siteCount: number
  speciesCount: number
  speciesThreatenedCount: number
  maxDate?: Date
  minDate?: Date
} | null}>()

const samplingDuration = computed(() => props.metrics?.maxDate === undefined || props.metrics?.minDate === undefined ? undefined : dayjs(props.metrics?.maxDate).diff(dayjs(props.metrics?.minDate), 'd'))
const areaMonitored = computed(() => props.metrics?.siteCount === undefined ? undefined : (props.metrics?.siteCount * 1.2345678)) // TODO calculate area

</script>
