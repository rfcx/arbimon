<template>
  <page-title
    page-title="Activity Overview"
  >
    <dropdown-menu>
      <dropdown-menu-item
        :disabled="!hasData"
        @click="exportCSV"
      >
        <icon-fas-hammer class="mr-2" /> Export as CSV
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
