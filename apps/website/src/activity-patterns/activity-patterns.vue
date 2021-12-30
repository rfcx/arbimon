<template>
  <div>
    <page-title
      page-title="Species Spotlight"
      page-information="This page will allow you to explore essential information about species natural history and how vocal activity patterns of specific species change through time and space."
      :topic="$route.name"
    >
      <dropdown-menu>
        <dropdown-menu-item
          :disabled="!hasExportData"
          @click="exportDetectionsData"
        >
          <icon-far-file-archive class="mr-2" /> Export as CSV
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
    <div class="grid grid-cols-6 py-2">
      <div class="col-span-6 md:col-span-4">
        <species-background-information
          :species="speciesInformation"
        />
      </div>
      <div class="col-span-6 px-0 mt-6 md:(col-span-2 border-l-2 border-faded mt-0 px-4)">
        <!-- TODO ?? : Add tab to swap between photo / species call -->
        <div class="grid grid-cols-2 gap-4">
          <species-images
            v-if="speciesInformation"
            :species="speciesInformation"
          />
          <spotlight-player
            v-if="speciesCall"
            :species-call="speciesCall"
          />
        </div>
      </div>
    </div>
    <activity-patterns-metrics
      :metrics="metrics"
      class="mt-6"
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
