<template>
  <div class="w-full">
    <section-title>
      <template #title>
        <div class="lg:(flex flex-row items-center) text-subtle">
          <select
            v-model="selectedType"
            class="text-xl py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-1 border-dotted cursor-pointer focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-1 ring-0 outline-none)"
          >
            <option
              v-for="item in datasetType"
              :key="'detection-time-selector' + item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
          <span class="text-xl ml-2">
            by
          </span>
          <select
            v-model="selectedBucket"
            class="text-xl lowercase ml-2 py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-1 border-dotted cursor-pointer focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-1 ring-0 outline-none)"
          >
            <option
              v-for="bucket in Object.entries(buckets)"
              :key="bucket[0]"
              :value="bucket[0]"
            >
              {{ bucket[1] }}
            </option>
          </select>
        </div>
      </template>
      <template #controls>
        <export-button
          v-if="hasData"
          @click="downloadChart()"
        />
      </template>
    </section-title>
    <line-chart-component
      :dom-id="domId"
      :config="config"
      :datasets="datasetsForSelectedBucket"
      :loading="loading"
      class="mt-2"
    />
  </div>
</template>

<script setup lang="ts">
import numeral from 'numeral'
import { computed, ref } from 'vue'

import { type SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { downloadSvgAsPng } from '~/charts'
import { type LineChartConfig, type LineChartSeries, DEFAULT_YAXIS_LINE_FORMAT, generateChartExport, LineChartComponent } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { type TimeBucket, TIME_BUCKET_BOUNDS, TIME_BUCKET_LABELS, TIME_LABEL_FORMATTERS } from '~/time-buckets'
import { type ActivityPatternsDataByTimeBucket, ACTIVITY_PATTERN_TIME_KEYS } from '../../types'
import { type SpotlightTimeDataset } from './types'

type ActivityPatternsDataByTimeType = keyof ActivityPatternsDataByTimeBucket

// TODO ???: Reduce and move to somewhere for center use
interface DropDownOption {
  label: string
  value: ActivityPatternsDataByTimeType
}

const props = withDefaults(defineProps<{
  domId: string,
  species: SpeciesInProjectTypes['light'] | null,
  datasets: SpotlightTimeDataset[]
  loading: boolean
}>(), {
  loading: false
})

const DATASET_LABELS = {
  [ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency]: 'Detection Frequency',
  [ACTIVITY_PATTERN_TIME_KEYS.detection]: 'Detections (raw)'
}

const buckets = ref<Record<TimeBucket, string>>(TIME_BUCKET_LABELS)
const selectedBucket = ref<TimeBucket>('hourOfDay')
const datasetType = ref<DropDownOption[]>([
  { label: DATASET_LABELS[ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency], value: ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency },
  { label: DATASET_LABELS[ACTIVITY_PATTERN_TIME_KEYS.detection], value: ACTIVITY_PATTERN_TIME_KEYS.detection }
])
const selectedType = ref<ActivityPatternsDataByTimeType>(ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency)

const config = computed<Omit<LineChartConfig, 'width'>>(() => {
  return {
    height: 450,
    margins: { top: 20, right: 10, bottom: 30, left: 40 },
    xTitle: TIME_BUCKET_LABELS[selectedBucket.value],
    yTitle: DATASET_LABELS[selectedType.value],
    xBounds: TIME_BUCKET_BOUNDS[selectedBucket.value],
    xLabelFormatter: selectedBucket.value === 'date'
      ? n => dayjs.unix(n).format('MMM-DD YY')
      : TIME_LABEL_FORMATTERS[selectedBucket.value],
    yLabelFormatter: displayWholeNumber.value
      ? (n) => Number.isInteger(n) ? numeral(n).format('0,0') : ''
      : DEFAULT_YAXIS_LINE_FORMAT
  }
})

const displayWholeNumber = computed(() => {
  return selectedType.value === datasetType.value[1].value
})

const datasetsForSelectedBucket = computed<LineChartSeries[]>(() => {
  return props.datasets.map(({ color, data }) => ({ color, data: data[selectedBucket.value][selectedType.value] ?? [] }))
})

const hasData = computed((): boolean => {
  return !props.loading && datasetsForSelectedBucket.value
    .some(ds => Object.values(ds.data).some(val => val > 0))
})

const downloadChart = async (): Promise<void> => {
  const margins = { ...config.value.margins, bottom: 80, left: 80 }
  const exportConfig = { ...config.value, margins, width: 1024, height: 576 }
  const svg = generateChartExport(datasetsForSelectedBucket.value, exportConfig)
  if (!svg) {
    return
  }

  await downloadSvgAsPng(svg, getExportGroupName(`${props.domId}-${selectedBucket.value}--${props.species?.taxonSpeciesSlug ?? ''}`))
}
</script>
