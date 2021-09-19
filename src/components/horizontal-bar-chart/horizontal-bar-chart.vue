<template>
  <div class="้horizontal-bar-chart-component">
    <div
      v-if="!hasData"
      class="no-chart-data text-center text-white text-xl"
    >
      No chart data
    </div>
    <div
      v-else
      id="multi-bar-chart"
    />
  </div>
</template>
<script src="./horizontal-bar-chart.ts" lang="ts" />
