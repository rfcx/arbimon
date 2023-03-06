<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
    <div
      v-if="loading"
      class="loading-shimmer h-full min-h-32"
    />
    <no-data-panel
      v-else-if="!hasData"
      class="h-full min-h-32"
    />
    <div
      v-show="hasData"
      :id="domId"
    />
  </div>
</template>
<script src="./line-chart.ts" lang="ts"></script>
