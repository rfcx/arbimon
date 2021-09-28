<template>
  <div
    id="horizontal-bar-chart-component"
    class="w-full"
  >
    <div class="flex justify-between">
      <h2 class="text-white text-xl">
        {{ chartTitle }}
      </h2>
      <!-- TODO: 74 improve style of the whole chart section -->
      <button
        v-if="hasData"
        class="btn btn-icon"
        @click="downloadChart()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </button>
    </div>
    <div
      v-if="!hasData"
      class="no-chart-data text-center text-white"
    >
      No chart data
    </div>
    <div v-show="hasData">
      <div
        :id="chartId"
      />
    </div>
  </div>
</template>
<script src="./horizontal-bar-chart.ts" lang="ts" />
