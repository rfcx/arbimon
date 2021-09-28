<template>
  <div
    id="horizontal-bar-chart-component"
    class="w-full"
  >
    <div
      v-if="!hasData"
      class="no-chart-data text-center text-white"
    >
      No chart data
    </div>
    <div v-show="hasData">
      <!-- TODO: improve style of the whole chart section -->
      <button
        @click="exportChart()"
      >
        Download
      </button>
      <div
        :id="chartId"
      />
    </div>
  </div>
</template>
<script src="./horizontal-bar-chart.ts" lang="ts" />
