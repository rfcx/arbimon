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
    />
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'

import { downloadSvgAsPng } from '~/charts'
import { BarChartConfig, generateChartExport, GroupedBarChartItem, HorizontalBarChartComponent } from '~/charts/horizontal-bar-chart'
import { getExportGroupName } from '~/filters'

const DEFAULT_CHART_PREFIX = 'Species-By-Taxonomy'

const props = defineProps<{ domId: string, chartData: GroupedBarChartItem[] }>()

const hasData = computed(() => {
  return props.chartData.length > 0
})

const config = computed((): Omit<BarChartConfig, 'width'> => {
  return {
    margins: { top: 20, right: 20, bottom: 30, left: 80 },
    xTitle: 'Number of species',
    displayXAxisTick: false,
    fontColor: 'white'
  }
})

const downloadChart = async () => {
  const cf = { ...config.value, width: 1024, displayXAxisTick: true, fontColor: 'black' }
  const svg = generateChartExport(props.chartData, cf)
  if (!svg) return

  await downloadSvgAsPng(svg, getExportGroupName(DEFAULT_CHART_PREFIX))
}

</script>
