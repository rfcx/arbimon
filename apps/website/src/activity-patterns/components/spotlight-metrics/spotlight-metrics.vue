<template>
  <div class="grid grid-cols-2 <sm:grid-cols-1">
    <template
      v-for="(item, idx) in metrics"
      :key="'metrics-info-' + idx"
    >
      <div class="<sm:(first:mb-4) mr-8 px-8 py-6 bg-steel-grey rounded-4xl border-subtle last:border-none">
        <metrics-title
          :title="item.title"
          :information="item.information"
        />
        <metrics-single
          v-if="item.datasets.length === 1"
          :value="item.datasets[0].value"
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
<script lang="ts" src="./spotlight-metrics"></script>
