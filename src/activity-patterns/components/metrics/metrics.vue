<template>
  <div class="grid grid-cols-2">
    <template
      v-for="(item, idx) in metrics"
      :key="'metrics-info-' + idx"
    >
      <div class="first:(pr-6 pl-0) px-6 py-4 border-r-1 border-subtle last:border-none">
        <metrics-title
          :title="item.title"
          :information="item.information"
        />
        <metrics-single
          v-if="item.datasets.length === 1"
          :value="item.datasets[0].percentage"
          :description="item.datasets[0].description"
        />
        <metrics-multi
          v-else
          :datasets="item.datasets"
        />
      </div>
    </template>
  </div>
</template>
<script lang="ts" src="./metrics.ts"></script>
