<template>
  <div
    v-if="predictedOccupancyMaps.length > 0"
    class="w-full"
  >
    <section-title>
      <template #title>
        <div class="text-xl text-subtle">
          Predicted Occupancy
        </div>
      </template>
    </section-title>
    <div
      class="mt-5 grid gap-4"
      :class="{ ['md:grid-cols-2']: predictedOccupancyMaps.length> 1 }"
    >
      <div
        v-for="(predictedOccupancyMap, idx) in predictedOccupancyMaps"
        :key="predictedOccupancyMap.title"
        class="relative"
      >
        <a
          :href="blobUrls[idx]"
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
