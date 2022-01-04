<template>
  <page-title
    page-title="Species Richness"
    page-information="This page will allow you to explore how the number of detected species changes over time and across the landscape."
    :topic="infoTopic"
  >
    <dropdown-menu>
      <template #label>
        <icon-fa-download class="mr-2" /> Download Data
      </template>
      <dropdown-menu-item
        :disabled="!haveData"
        :title=" haveData ? '' : 'No data selected'"
        @click="exportCsvReports()"
      >
        <icon-far-file-archive class="mr-2" /> Export CSV
      </dropdown-menu-item>
    </dropdown-menu>
  </page-title>
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
