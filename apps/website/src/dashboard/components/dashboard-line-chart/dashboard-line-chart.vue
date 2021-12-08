<template>
  <line-chart-component
    dom-id="dashboard-line-chart"
    :config="config"
    :datasets="chartData"
  />
</template>
<script lang="ts" src="./dashboard-line-chart.ts"></script>
