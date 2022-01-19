<template>
  <div>
    <page-title
      page-title="Species Spotlight"
      page-subtitle="An in-depth look at the detection and occupancy trends of a single species"
      :topic="infoTopic"
    >
      <dropdown-menu>
        <template #label>
          <icon-fa-download class="mr-2" /> Download Data
        </template>
        <dropdown-menu-item
          :disabled="!hasExportData"
          @click="exportDetectionsData"
        >
          <icon-far-file-archive class="mr-2" /> Export CSV
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
    <location-redacted-banner
      v-if="isLocationRedacted"
      class="mt-5"
    />
    <activity-patterns-by-location
      v-else
      :datasets="mapDatasets"
      :species="species"
      class="mt-5"
    />
    <activity-patterns-predicted-occupancy
      :predicted-occupancy-maps="predictedOccupancyMaps"
      class="mt-5"
    />
    <activity-patterns-by-time
      dom-id="activity-by-time"
      :species="species"
      :datasets="timeDatasets"
      class="my-5"
    />
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
