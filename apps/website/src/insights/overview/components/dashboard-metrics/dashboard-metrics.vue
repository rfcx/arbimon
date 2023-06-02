<template>
  <div
    v-if="loading || metrics === null"
  >
    <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24">
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <p>&nbsp;</p>
    </div>
    <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24" />
    <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24" />
    <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24" />
  </div>
  <div
    v-else
    class="gap-8 columns-4 <sm:columns-2 <sm:text-center"
  >
    <numeric-metric
      title="Threatened / detected"
      :value="metrics.speciesThreatenedCount"
      :total-value="metrics.speciesCount"
      unit="species"
      tooltip-text="Scientific term: test"
    />
    <numeric-metric
      title="Area monitored"
      :value="areaMonitored"
      unit="sq km"
    />
    <numeric-metric
      title="Recorders deployed"
      :value="metrics.siteCount"
      unit="sites"
    />
    <numeric-metric
      title="Sampling duration"
      :value="samplingDuration"
      unit="days"
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
