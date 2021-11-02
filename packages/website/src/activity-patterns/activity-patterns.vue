<template>
  <page-title
    page-title="Activity Patterns"
    page-subtitle="Trends in detections and occupancy"
  >
    <dropdown-menu>
      <dropdown-menu-item>
        <icon-fas-hammer class="mr-2" /> TODO
      </dropdown-menu-item>
    </dropdown-menu>
  </page-title>
  <comparison-list-component
    class="mt-5"
    @emitSelect="onFilterChange"
  />
  <species-selector
    :species-slug="$route.params.speciesSlug"
    @emitSelectedSpeciesChanged="onSelectedSpeciesChange"
  />
  <species-background-information
    :species="species"
  />
  <activity-patterns-metrics
    v-if="metrics.length > 0"
    :metrics="metrics"
    class="mt-5"
  />
  <activity-patterns-by-location
    v-if="false"
    :datasets="[]"
    class="mt-5"
  />
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
