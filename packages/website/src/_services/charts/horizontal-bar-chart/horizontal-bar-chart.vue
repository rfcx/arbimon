<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
    <div class="flex justify-between items-end">
      <h2 class="text-white text-xl">
        {{ chartTitle }}
      </h2>
      <export-button
        v-if="hasData"
        @click="downloadChart()"
      />
    </div>
    <no-data-panel
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
