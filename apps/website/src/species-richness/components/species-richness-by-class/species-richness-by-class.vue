<template>
  <div class="w-full">
    <div class="flex justify-between items-end">
      <h2 class="text-white text-xl">
        Distinct species by taxonomic class
      </h2>
      <export-button
        v-if="hasData"
        @click="downloadChart()"
      />
    </div>
    <horizontal-bar-chart-component
      dom-id="species-by-class"
      :config="config"
      :chart-data="chartData"
    />
  </div>
</template>
<script lang="ts" src="./species-richness-by-class.ts"></script>
