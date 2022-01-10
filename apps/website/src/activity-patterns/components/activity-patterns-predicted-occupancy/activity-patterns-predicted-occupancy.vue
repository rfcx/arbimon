<template>
  <div
    v-if="predictedOccupancyMaps.length > 0"
    class="w-full"
  >
    <section-title title="Predicted Occupancy" />
    <div
      class="mt-5 grid gap-4"
      :class="{ ['md:grid-cols-2']: predictedOccupancyMaps.length> 1 }"
    >
      <a
        v-for="predictedOccupancyMap in predictedOccupancyMaps"
        :key="predictedOccupancyMap.title"
        :href="predictedOccupancyMap.url"
        target="_blank"
      >
        <img
          :src="predictedOccupancyMap.url"
          :alt="predictedOccupancyMap.title"
        >
      </a>
    </div>
  </div>
</template>
<script lang="ts" src="./activity-patterns-predicted-occupancy.ts"></script>
