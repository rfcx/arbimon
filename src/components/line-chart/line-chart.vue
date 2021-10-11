<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
    <!-- TODO 20 - Standardized "No data" styles -->
    <div
      v-if="!hasData"
      class="text-center text-white"
    >
      No data
    </div>
    <div
      v-show="hasData"
      :id="domId"
    />
  </div>
</template>
<script src="./line-chart.ts" lang="ts"></script>
