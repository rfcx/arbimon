<template>
  <!-- <draft-banner
    current-mode="Draft"
    :sync-updated="store.projectFilters?.updatedList[0]?.updatedAt ?? null"
    :project-slug="store.selectedProject?.slug"
  /> -->
  <species-richness-introduction
    :filters="filters"
    :have-data="haveData"
    :richness-by-exports="speciesByExports"
  />
  <comparison-list-component
    class="mt-5"
    @emit-select="onFilterChange"
  />
  <species-richness-by-class
    dom-id="species-by-class"
    :chart-data="speciesByClassDatasets"
    class="mt-5"
  />
  <species-richness-by-location
    :datasets="speciesByLocationDatasets"
    class="mt-5"
  />
  <species-richness-by-time
    dom-id="species-by-time"
    :datasets="speciesByTimeDatasets"
    class="mt-5"
  />
  <species-richness-detected-species
    :table-data="detectedSpecies"
    :colors="colors"
    class="mt-5"
  />
</template>
<script src="./species-richness.ts" lang="ts"></script>
