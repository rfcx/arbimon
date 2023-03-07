<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
    <div
      v-if="loading"
      class="loading-shimmer h-16 mt-2"
    />
    <no-data-panel
      v-else-if="!hasData"
      class="h-16 mt-2"
    />
    <div
      v-show="hasData"
      :id="domId"
      class="mt-2"
    />
  </div>
</template>
<script src="./horizontal-bar-chart.ts" lang="ts"></script>
