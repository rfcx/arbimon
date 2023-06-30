<template>
  <div class="line-chart relative">
    <LineChart
      dom-id="dashboard-line-chart"
      :config="lineChartConfig"
      :datasets="lineChartSeries"
    />
    <export-button
      v-if="hasLineChartData"
      class="absolute top-2 right-2"
      @click="downloadLineChart"
    />
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import numeral from 'numeral'
import { type ComputedRef, computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiBioGetDashboardDataByHour } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-hour'

import { apiClientBioKey, storeKey } from '@/globals'
import { downloadSvgAsPng } from '~/charts'
import { type LineChartConfig, type LineChartSeries, generateChartExport } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import type { BiodiversityStore } from '~/store'
import { TIME_BUCKET_LABELS } from '~/time-buckets'
import { useColor } from '../../composables/use-color'
import { type TabValue, TAB_VALUES } from '../../types/tabs'
import LineChart from './line-chart.vue'

const props = withDefaults(defineProps<{ selectedTab: TabValue }>(), {
  selectedTab: 'speciesRichness'
})

const { color } = useColor()
const store = inject(storeKey) as BiodiversityStore
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const route = useRoute()

const dataByHour = ref(await apiBioGetDashboardDataByHour(apiClientBio, store?.selectedProject?.id ?? -1))

watch(() => route.params.projectSlug, async (newRoute, oldRoute) => {
  if (newRoute !== oldRoute) {
    dataByHour.value = await apiBioGetDashboardDataByHour(apiClientBio, store?.selectedProject?.id ?? -1)
  }
})

const lineChartConfig: ComputedRef<Omit<LineChartConfig, 'width'>> = computed(() => {
  return {
    // tabHeight variable
    height: 360,
    margins: {
      top: 20,
      right: 10,
      bottom: 30,
      left: 40
    },
    xTitle: TIME_BUCKET_LABELS.hourOfDay,
    yTitle: props.selectedTab === 'speciesRichness' ? 'Number of species' : 'Detections (Raw)',
    xBounds: [0, 23],
    yLabelFormatter: (n) => Number.isInteger(n) ? numeral(n).format('0,0') : ''
  }
})

const lineChartData: ComputedRef<Record<number, number> | null> = computed(() => {
  return props.selectedTab === TAB_VALUES.richness
    ? dataByHour.value?.richnessByHour ?? null
    : dataByHour.value?.detectionByHour ?? null
})

const lineChartSeries: ComputedRef<LineChartSeries[]> = computed(() => {
  return lineChartData.value ? [{ color: color.value, data: lineChartData.value }] : []
})

const downloadLineChart = async (): Promise<void> => {
  const margins = { ...lineChartConfig.value.margins, bottom: 80, left: 80 }
  const exportConfig = { ...lineChartConfig.value, margins, width: 1024, height: 576 }
  const svg = generateChartExport(lineChartSeries.value, exportConfig)

  if (!svg) {
    return
  }

  await downloadSvgAsPng(svg, getExportGroupName(`dashboard-${props.selectedTab}-line-chart`))
}

const hasLineChartData: ComputedRef<boolean> = computed(() => {
  return !lineChartData.value || Object.keys(lineChartData.value).length > 0
})
</script>
