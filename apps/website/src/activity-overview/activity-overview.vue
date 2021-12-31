<template>
  <page-title
    page-title="Activity Overview"
    page-information="This page will allow you to explore how vocal activity patterns of entire bird, amphibians, insects or mammal communities change through time and space."
    :topic="$route.name"
  >
    <dropdown-menu>
      <template #label>
        <icon-fa-download class="mr-2" /> Download Data
      </template>
      <dropdown-menu-item
        :disabled="!hasData"
        @click="exportSpeciesData"
      >
        <icon-far-file-archive class="mr-2" /> Export CSV
      </dropdown-menu-item>
    </dropdown-menu>
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
  <activity-overview-by-species :table-data="tableDatasets" />
</template>
<script lang="ts" src="./activity-overview.ts"></script>
