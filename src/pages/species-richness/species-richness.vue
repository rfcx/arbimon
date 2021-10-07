<template>
  <div id="species-richness-page">
    <div class="flex flex-row justify-between items-center w-full">
      <div class="header-container">
        <h1 class="text-white text-4xl capitalize">
          Species Richness
        </h1>
        <p class="text-white">
          Number of distinct species detected
        </p>
      </div>
      <div>
        <export-button-view
          @click="exportCSVReport()"
        >
          <template #label>
            <div class="ml-2">
              download csv
            </div>
          </template>
        </export-button-view>
      </div>
    </div>
    <comparison-list-component @emitSelect="onFilterChange" />
    <horizontal-bar-chart-component
      dom-id="species-in-taxonomic-group"
      chart-title="Number of species in each taxonomic group"
      :chart-data="chartData"
      class="mt-5"
    />
    <species-richness-maps
      :datasets="mapDatasets"
      class="mt-5"
    />
    <species-richness-table
      :table-data="tableData"
    />
  </div>
</template>
<script src="./species-richness.ts" lang="ts"></script>
