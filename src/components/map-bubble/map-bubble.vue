<template>
  <div
    id="map-bubble-component"
    class="w-full"
  >
    <div
      v-if="noData"
      class="no-chart-data text-center text-white"
    >
      No chart data
    </div>
    <div
      v-show="!noData"
      id="map-bubble"
      class="w-full aspect-16/9"
    />
  </div>
</template>
<script src="./map-bubble.ts" lang="ts" />
