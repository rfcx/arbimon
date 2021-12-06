<template>
  <page-title
    page-title="Species Richness"
    page-subtitle="Number of distinct species detected"
  >
    <dropdown-menu>
      <dropdown-menu-item
        :disabled="!haveData"
        :title=" haveData ? '' : 'No data selected'"
        @click="exportCsvReports()"
      >
        <icon-far-file-archive class="mr-2" /> Export as CSV
      </dropdown-menu-item>
    </dropdown-menu>
  </page-title>
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
