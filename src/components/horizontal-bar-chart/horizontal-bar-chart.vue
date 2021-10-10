<template>
  <div
    id="horizontal-bar-chart-component"
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        {{ chartTitle }}
      </h2>
      <!-- TODO: 74 improve style of the whole chart section -->
      <export-button-view
        v-if="hasData"
        @click="downloadChart()"
      />
    </div>
    <div
      v-if="!hasData"
      class="text-center text-secondary min-h-32 flex justify-center items-center border-2 border-secondary"
    >
      No data
    </div>
    <div
      v-show="hasData"
      :id="domId"
    />
  </div>
</template>
<script src="./horizontal-bar-chart.ts" lang="ts"></script>
