<template>
  <page-title
    page-title="Species Richness"
    page-subtitle="Diversity of detected species"
    :topic="infoTopic"
  >
    <dropdown-menu>
      <template #label>
        <icon-fa-save />
        <div class="ml-2 <md:hidden">
          Download Data
        </div>
      </template>
      <dropdown-menu-item
        :disabled="!haveData"
        :title=" haveData ? '' : 'No data selected'"
        @click="exportCsvReports()"
      >
        <icon-far-file-archive />
        <div class="ml-2">
          Export CSV
        </div>
      </dropdown-menu-item>
    </dropdown-menu>
  </page-title>
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
