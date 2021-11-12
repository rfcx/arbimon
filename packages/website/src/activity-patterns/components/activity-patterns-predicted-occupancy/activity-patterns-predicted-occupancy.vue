<template>
  <div
    v-if="predictedOccupancyImages.length > 0"
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        Predicted Occupancy Analysis
      </h2>
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <a
        v-for="predictedOccupancyImage in predictedOccupancyImages"
        :key="predictedOccupancyImage[0]"
        :href="predictedOccupancyImage[1]"
      >
        <img
          :src="predictedOccupancyImage[1]"
          :alt="predictedOccupancyImage[0]"
        >
      </a>
    </div>
  </div>
</template>
<script lang="ts" src="./activity-patterns-predicted-occupancy.ts"></script>
