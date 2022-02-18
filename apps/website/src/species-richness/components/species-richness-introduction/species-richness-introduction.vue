<template>
  <page-title
    page-title="Species Richness"
    page-subtitle="Diversity of detected species"
    :topic="infoTopic"
  >
    <export-button
      :disabled="!haveData || loading"
      :loading="loading"
      :title=" haveData ? '' : 'No data selected'"
      @click="exportCsvReports()"
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
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
