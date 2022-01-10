<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
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
