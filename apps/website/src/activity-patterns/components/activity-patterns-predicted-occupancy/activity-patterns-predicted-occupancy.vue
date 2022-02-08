<template>
  <div
    v-if="predictedOccupancyMaps.length > 0"
    class="w-full"
  >
    <section-title title="Predicted Occupancy" />
    <div
      class="mt-5 grid gap-4 relative"
      :class="{ ['md:grid-cols-2']: predictedOccupancyMaps.length> 1 }"
    >
      <img
        v-for="predictedOccupancyMap in predictedOccupancyMapImages"
        :key="predictedOccupancyMap.title"
        :src="predictedOccupancyMap.url"
        :alt="predictedOccupancyMap.title"
      >
    </div>
  </div>
</template>
<script lang="ts" src="./activity-patterns-predicted-occupancy.ts"></script>
