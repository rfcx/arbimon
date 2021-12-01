<template>
  <div>
    <no-data-panel
      v-if="!hasData"
      class="<sm:h-34 lg:h-144"
    />
    <div v-else>
      <line-chart-component
        dom-id="dashboard-line-chart"
        :config="config"
        :datasets="chartData"
      />
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-line-chart.ts"></script>
