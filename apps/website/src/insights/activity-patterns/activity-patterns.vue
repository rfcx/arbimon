<template>
  <div>
    <!-- <draft-banner
      current-mode="Draft"
      :sync-updated="store.projectFilters?.latestSync?.updatedAt ?? null"
      :project-slug="store.selectedProject?.slug"
    /> -->
    <page-title
      page-title="Species Spotlight"
      page-subtitle="An in-depth look at the detection and occupancy trends of a single species"
      :topic="infoTopic"
    >
      <export-button
        :disabled="!hasExportData || !isProjectMember"
        :title="isProjectMember ? (hasExportData ? '' : 'No data selected') : 'Only available to project members'"
        @click="exportDetectionsData()"
      >
        <template #label>
          <div class="ml-2 <md:hidden">
            Download Source
          </div>
          <div class="ml-2 md:hidden">
            Source
          </div>
        </template>
      </export-button>
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
    <species-title
      :species="speciesInformation"
      :loading="loadingSpecies"
    />
    <div class="grid grid-cols-5 gap-x-2rem">
      <div class="col-span-full lg:col-span-2">
        <species-images
          :species-photos="speciesPhotos"
          :loading="loadingSpecies"
        />
        <spotlight-player
          :species-calls="speciesCalls"
          :loading="loadingSpecies"
          class="mt-4"
        />
        <species-background-information
          :species-information="speciesInformation"
          :loading="loadingSpecies"
          class="my-4"
        />
      </div>
      <div class="col-span-full lg:col-span-3">
        <spotlight-metrics
          :metrics="metrics"
          :loading="loadingDatasets"
        />
        <location-redacted-banner
          v-if="isLocationRedacted && !loadingDatasets"
          class="mt-4"
        />
        <activity-patterns-by-location
          v-else
          :datasets="mapDatasets"
          :loading="loadingDatasets"
          :species="species"
          class="mt-4"
        />
        <activity-patterns-predicted-occupancy
          :species-slug="$route.params.speciesSlug"
          :predicted-occupancy-maps="predictedOccupancyMaps"
          class="mt-4"
        />
        <activity-patterns-by-time
          dom-id="activity-by-time"
          :species="species"
          :datasets="timeDatasets"
          :loading="loadingDatasets"
          class="my-4"
        />
      </div>
    </div>
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
