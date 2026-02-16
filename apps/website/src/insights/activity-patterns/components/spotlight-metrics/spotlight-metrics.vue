<template>
  <div
    v-if="loading"
    class="loading-shimmer h-16"
  />
  <div
    v-else
    class="grid grid-cols-2 gap-x-6 <sm:grid-cols-1"
  >
    <template
      v-for="(item, idx) in metrics"
      :key="'metrics-info-' + idx"
    >
      <div class="<sm:(first:mb-4)">
        <metrics-title
          :title="item.title"
          :information="item.information"
        />
        <metrics-single
          v-if="item.datasets.length === 1"
          :value="item.datasets[0].value"
          :title="item.datasets[0].title"
          :description="item.datasets[0].description"
        />
        <metrics-multi
          v-else
          :datasets="item.datasets"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Metrics } from '../../types'
import MetricsTitle from './metrics-title.vue'
import MetricsMulti from './multi-metrics.vue'
import MetricsSingle from './single-metrics.vue'

withDefaults(defineProps<{ metrics: Metrics[], loading: boolean }>(), {
  loading: false
})
</script>
