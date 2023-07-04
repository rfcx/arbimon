<template>
  <div
    :id="`wrapper-${domId}`"
    class="w-full"
  >
    <no-data-panel
      v-if="!hasData"
      class="h-full min-h-32"
    />
    <div
      v-else
      v-show="hasData"
      :id="domId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'

import { clearChart } from '~/charts'
import { generateChartInternal } from '~/charts/line-chart/functions'
import { type LineChartConfig, type LineChartSeries } from '~/charts/line-chart/types'

const props = defineProps<{
  domId: string,
  config: Omit<LineChartConfig, 'width'>,
  datasets: LineChartSeries[]
}>()

const hasData = computed<boolean>(() => {
  return props.datasets.some(ds => Object.values(ds.data).some(val => val > 0))
})

const updateChart = (): void => {
  const parent = document.getElementById(props.domId)
  if (!parent) return

  const width = (document.getElementById(`wrapper-${props.domId}`)?.clientWidth ?? 500)
  const config = { ...props.config, width }
  const chart = generateChartInternal(props.datasets, config)
  if (!chart) return

  clearChart(props.domId)
  parent.appendChild(chart)
}

watch(() => props.datasets, () => {
  updateChart()
}, { deep: true, immediate: true })

watch(() => props.config, () => {
  updateChart()
})

onMounted(() => {
  window.addEventListener('resize', updateChart)
  updateChart()
})
</script>

<style lang="scss">
</style>
