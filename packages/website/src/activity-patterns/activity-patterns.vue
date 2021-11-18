<template>
  <div>
    <page-title
      page-title="Species Spotlight"
      page-subtitle="An in-depth look at the detections and occupancy trends of a single species"
    >
      <dropdown-menu>
        <dropdown-menu-item>
          <icon-fas-hammer class="mr-2" /> TODO
        </dropdown-menu-item>
      </dropdown-menu>
    </page-title>
    <comparison-list-component
      class="mt-5"
      :can-filter-by-taxon="false"
      @emit-select="onFilterChange"
    />
    <species-selector
      :species-slug="$route.params.speciesSlug"
      @emit-selected-species-changed="onSelectedSpeciesChange"
    />
    <species-background-information
      :species="species"
    />
    <activity-patterns-metrics
      :metrics="metrics"
      class="mt-5"
    />
    <activity-patterns-predicted-occupancy
      :predicted-occupancy-maps="predictedOccupancyMaps"
      class="mt-5"
    />
    <activity-patterns-by-location
      :datasets="mapDatasets"
      class="mt-5"
    />
    <activity-patterns-by-time
      dom-id="activity-by-time"
      :datasets="timeDatasets"
      class="my-5"
    />
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
