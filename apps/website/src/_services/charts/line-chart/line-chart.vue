<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
    <no-data-panel
      v-if="!hasData"
      class="h-full min-h-32 mt-2"
    />
    <div
      v-show="hasData"
      :id="domId"
    />
  </div>
</template>
<script src="./line-chart.ts" lang="ts"></script>
