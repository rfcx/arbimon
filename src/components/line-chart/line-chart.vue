<template>
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
</template>
<script src="./line-chart.ts" lang="ts"></script>
