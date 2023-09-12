<template>
  <div class="mb-10 md:mb-20">
    <dashboard-metrics
      :loading="false"
      :metrics="metrics"
    />
  </div>
  <dashboard-species :dataset="richnessByRisk" />
</template>

<script setup lang="ts">
import dashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import dashboardSpecies from './components/dashboard-species/dashboard-threatened-species.vue'
import type { HorizontalStack } from './components/dashboard-species/types'

const metrics = {
  detectionMinutesCount: 0,
  siteCount: 0,
  speciesCount: 0,
  speciesThreatenedCount: 0,
  maxDate: new Date(),
  minDate: new Date()
}

const richnessByRisk: HorizontalStack[] = [
  {
    name: 'Critically Endangered',
    color: '#008059',
    count: 100
  },
  {
    name: 'Endangered',
    color: '#FFAFAF',
    count: 75
  },
  {
    name: 'Vulnerable',
    color: '#FF6868',
    count: 25
  }
]
</script>
