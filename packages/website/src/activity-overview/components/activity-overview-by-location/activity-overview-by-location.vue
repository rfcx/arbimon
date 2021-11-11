<template>
  <div class="w-full">
    <div class="flex flex-row items-center">
      <select
        v-model="selectedDatasetType"
        class="text-xl py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-2 focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-2 ring-0 outline-none)"
      >
        <option
          v-for="item in datasetTypes"
          :key="'detection-location-selector' + item.value"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
      <h2 class="text-white text-xl ml-1">
        by location
      </h2>
    </div>
  </div>
</template>
<script lang="ts" src="./activity-overview-by-location.ts"></script>
