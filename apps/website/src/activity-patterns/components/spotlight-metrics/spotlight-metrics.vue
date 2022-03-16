<template>
  <div class="grid grid-cols-2 gap-x-6 <sm:grid-cols-1">
    <template
      v-for="(item, idx) in metrics"
      :key="'metrics-info-' + idx"
    >
      <div class="<sm:(first:mb-4)">
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
