<template>
  <div class="grid grid-cols-2">
    <template
      v-for="(item, idx) in metricsInformation"
      :key="'metrics-info-' + idx"
    >
      <div class="px-6 py-4 border-r-2 last:border-none">
        <metrics-title
          :title="item.title"
          :information="item.information"
        />
        <single-metrics
          v-if="item.datasets.length === 1"
          :value="item.datasets[0].value"
          :description="item.datasets[0].description"
        />
        <multi-metrics v-else />
      </div>
    </template>
  </div>
</template>
<script lang="ts" src="./metrics.ts"></script>
