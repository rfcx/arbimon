<template>
  <page-title
    page-title="Species Richness"
    page-subtitle="Diversity of detected species"
    :topic="infoTopic"
  >
    <export-button
      :disabled="loading || !hasData || !isProjectMember"
      :loading="loading"
      :title="isProjectMember ? (hasData ? '' : 'No data selected') : 'Only available to project members'"
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
