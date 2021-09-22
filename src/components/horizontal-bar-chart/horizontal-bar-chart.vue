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
    <div
      v-show="hasData"
      id="multi-bar-chart"
    />
  </div>
</template>
<script src="./horizontal-bar-chart.ts" lang="ts" />
