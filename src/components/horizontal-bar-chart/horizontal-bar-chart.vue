<template>
  <div
    id="horizontal-bar-chart-component"
    class="w-full"
  >
    <div class="flex justify-between items-end">
      <h2 class="text-white text-xl">
        {{ chartTitle }}
      </h2>
      <!-- TODO: 74 improve style of the whole chart section -->
      <export-button-view
        v-if="hasData"
        @click="downloadChart()"
      />
    </div>
    <no-data-container-view
      v-if="!hasData"
      class="h-32 mt-2"
    />
    <div
      v-show="hasData"
      :id="domId"
      class="mt-2"
    />
  </div>
</template>
<script src="./horizontal-bar-chart.ts" lang="ts"></script>
