<template>
  <numeric-metric
    :value="metrics.detectionCount"
    subtitle="detections"
  />
  <numeric-metric
    class="ml-4"
    :value="metrics.siteCount"
    subtitle="sites"
  />
  <numeric-metric
    class="ml-4"
    :value="metrics.endangeredSpecies"
    :total-value="metrics.endangeredSpecies"
    subtitle="endangered"
  />
</template>
<script lang="ts" src="./dashboard-metrics.ts"></script>
