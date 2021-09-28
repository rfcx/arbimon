<template>
  <div
    id="map-bubble-component"
    class="w-full"
  >
    <div
      v-if="noData"
      class="no-chart-data text-center text-white"
    >
      No data
    </div>
    <div
      v-show="!noData"
      id="map-bubble"
      class="w-full h-96 bg-white"
    />
  </div>
</template>
<script src="./map-bubble.ts" lang="ts" />
