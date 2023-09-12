<template>
  <div class="mb-10 md:mb-20">
    <dashboard-metrics
      :loading="false"
      :metrics="metrics"
    />
  </div>
  <h1>Threatened species</h1>
  <div>bar chart + filter & animal cards</div>
  <div>Map area</div>
  <h1>Project summary</h1>
</template>

<script setup lang="ts">
import dashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'

const metrics = {
  detectionMinutesCount: 0,
  siteCount: 0,
  speciesCount: 0,
  speciesThreatenedCount: 0,
  maxDate: new Date(),
  minDate: new Date()
}
</script>
