<template>
  <draft-banner
    current-mode="Draft"
    :sync-updated="store.projectFilters?.updatedList[0]?.updatedAt ?? null"
    :project-slug="store.selectedProject?.slug"
  />
  <page-title
    page-title="Activity Overview"
    page-subtitle="Temporal and spatial activity trends for all species"
    :topic="infoTopic"
  >
    <export-button
      :disabled="!hasData"
      :title="hasData ? '' : 'No data selected'"
      @click="exportSpeciesData()"
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
    @emit-select="onFilterChange"
  />
  <activity-overview-by-location
    class="mt-5"
    :datasets="mapDatasets"
  />
  <activity-overview-by-time
    class="mt-5"
    dom-id="activity-overview-by-time"
    :datasets="timeDatasets"
  />
  <activity-overview-by-species :datasets="tableDatasets" />
</template>
<script lang="ts" src="./activity-overview.ts"></script>
