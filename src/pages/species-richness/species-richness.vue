<template>
  <species-richness-introduction
    :filters="filters"
    :have-data="haveData"
  />
  <comparison-list-component @emitSelect="onFilterChange" />
  <horizontal-bar-chart-component
    dom-id="species-by-class"
    chart-title="Distinct species by taxonomic class"
    :chart-data="chartData"
    class="mt-5"
  />
  <species-richness-maps
    :datasets="mapDatasets"
    class="mt-5"
  />
  <species-richness-by-time
    dom-id="species-by-time"
    :datasets="speciesByTimeDatasets"
    class="mt-5"
  />
  <species-richness-table
    :table-data="tableData"
    :colors="colors"
    class="mt-5"
  />
</template>
<script src="./species-richness.ts" lang="ts"></script>
