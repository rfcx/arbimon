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
        <single-dataset-component
          :value="'25'"
          :description="'xxx'"
        />
      </div>
    </template>
  </div>
</template>
<script lang="ts" src="./metrics.ts"></script>
