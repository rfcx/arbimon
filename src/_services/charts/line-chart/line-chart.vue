<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
    <no-data-container-view
      v-if="!hasData"
      class="h-32 mt-2"
    />
    <div
      v-show="hasData"
      :id="domId"
    />
  </div>
</template>
<script src="./line-chart.ts" lang="ts"></script>
