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
      <div
        v-for="predictedOccupancyMap in predictedOccupancyMapImages"
        :key="predictedOccupancyMap.title"
        class="relative"
      >
        <a
          :href="predictedOccupancyMap.url"
          target="_blank"
        >
          <img
            :src="predictedOccupancyMap.url"
            :alt="predictedOccupancyMap.title"
          >
        </a>
        <export-button
          class="absolute top-2 right-2"
          @click="downloadImage(predictedOccupancyMap)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./activity-patterns-predicted-occupancy.ts"></script>
