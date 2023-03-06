<template>
  <div class="w-full">
    <section-title title="Distinct species by taxonomic class">
      <template #controls>
        <export-button
          v-if="hasData"
          @click="downloadChart()"
        />
      </template>
    </section-title>
    <horizontal-bar-chart-component
      dom-id="species-by-class"
      :config="config"
      :chart-data="chartData"
      :loading="loading"
    />
  </div>
</template>
<script lang="ts" src="./species-richness-by-class.ts"></script>
