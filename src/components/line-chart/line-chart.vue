<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        Distinct species count by time
      </h2>
      <div class="mb-2">
        BUTTONS
      </div>
    </div>
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
