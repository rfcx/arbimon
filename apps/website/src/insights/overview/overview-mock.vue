<template>
  <div class="mb-10 md:mb-20">
    <dashboard-metrics
      :loading="false"
      :metrics="metrics"
    />
  </div>
  <dashboard-species />
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/store'
import dashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import dashboardSpecies from './components/dashboard-species/dashboard-species.vue'

const dashboardStore = useDashboardStore()
// Data
const metrics = {
  detectionMinutesCount: 0,
  siteCount: 0,
  speciesCount: 9,
  speciesThreatenedCount: 0,
  maxDate: new Date(),
  minDate: new Date()
}

dashboardStore.updateSpeciesCount(`${metrics.speciesCount}`)

</script>
