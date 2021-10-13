<template>
  <div class="flex flex-row justify-between items-center w-full">
    <page-title-view>
      <template #title>
        Species Richness
      </template>
      <template #subtitle>
        Number of distinct species detected
      </template>
    </page-title-view>
    <div>
      <export-button-view
        :disabled="!haveData"
        title="No data in selections"
        @click="exportCSVReports()"
      >
        <template #label>
          <div class="ml-2">
            download csv
          </div>
        </template>
      </export-button-view>
    </div>
  </div>
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
