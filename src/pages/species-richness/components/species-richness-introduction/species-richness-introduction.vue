<template>
  <div class="flex flex-row justify-between items-center w-full">
    <div class="header-container">
      <h1 class="text-white text-4xl capitalize">
        Species Richness
      </h1>
      <p class="text-white">
        Number of distinct species detected
      </p>
    </div>
    <div>
      <export-button-view
        :disabled="!haveData"
        title="No data in selections"
        @click="exportCSVReport()"
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
