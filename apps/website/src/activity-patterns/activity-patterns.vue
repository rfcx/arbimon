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
      v-if="speciesInformation"
      :species="speciesInformation"
    />
    <div class="grid grid-cols-5 gap-x-2rem">
      <div class="col-span-full lg:col-span-2">
        <species-images
          v-if="speciesPhotos.length > 0"
          :species-photos="speciesPhotos"
          class="my-4"
        />
        <spotlight-player
          v-if="speciesCalls"
          :species-calls="speciesCalls"
        />
        <species-background-information
          :species-information="speciesInformation"
        />
      </div>
      <div class="col-span-full lg:col-span-3">
        <spotlight-metrics
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
          :loading="loading"
          :species="species"
          class="mt-5"
        />
        <activity-patterns-predicted-occupancy
          :species-slug="$route.params.speciesSlug"
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
    </div>
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
