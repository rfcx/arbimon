<template>
  <page-title
    page-title="Activity Overview / Detection"
    page-subtitle="Number of detection / frequency"
  >
    <dropdown-menu>
      <dropdown-menu-item>
        <icon-fas-hammer class="mr-2" /> TODO
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
</template>
<script lang="ts" src="./activity-overview.ts"></script>
