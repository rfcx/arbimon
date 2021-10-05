<template>
  <species-richness-introduction />
  <comparison-list-component @emitSelect="onFilterChange" />
  <horizontal-bar-chart-component
    chart-id="species-in-taxonomic-group"
    chart-title="Distinct species by taxonomic group"
    :chart-data="chartData"
    class="mt-5"
  />
  <species-richness-maps
    :datasets="mapDatasets"
    class="mt-5"
  />
  <line-chart-component
    :dom-id="'TODO20'"
    class="mt-5"
  />
</template>
<script src="./species-richness.ts" lang="ts"></script>
