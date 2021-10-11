<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        Distinct species by time
      </h2>
      <div class="mb-2">
        BUTTONS
      </div>
    </div>
    <line-chart-component
      :dom-id="domId"
      :config="config"
      :datasets="datasetsForPeriod"
    />
  </div>
</template>
<script src="./species-richness-by-time.ts" lang="ts"></script>
