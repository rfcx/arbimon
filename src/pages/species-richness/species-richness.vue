<template>
  <div id="species-richness-page">
    <div class="header-container">
      <h1 class="text-white text-4xl capitalize">
        Species Richness
      </h1>
      <p class="text-white">
        Number of distinct species detected
      </p>
    </div>
    <comparison-list-component @emitSelect="onFilterChange" />
    <horizontal-bar-chart-component
      chart-id="species-in-taxonomic-group"
      chart-title="Number of species in each taxonomic group"
      :chart-data="chartData"
      class="mt-5"
    />
    <species-richness-maps
      :datasets="mapDatasets"
      class="mt-5"
    />
    <species-richness-table
      :datasets="tableData"
      class="mt-5"
    />
  </div>
</template>
<script src="./species-richness.ts" lang="ts"></script>
