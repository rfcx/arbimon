<template>
  <div class="graphic-tabs mb-10">
    <ol class="text-xl lg:text-2xl xl:text-3xl">
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        class="cursor-pointer inline-block p-2 border-b-2 hover:text-frequency hover:border-frequency font-header font-2xl"
        :class="{ 'text-frequency border-frequency border-b-2': selectedTab === tabs[index].value }"
        :aria-selected="selectedTab === tabs[index].value"
        :tabindex="index"
        @click="selectedTab = tabs[index].value"
      >
        {{ tab.label }}
      </li>
    </ol>
  </div>
  <div class="inline-grid w-full gap-2 mt-2 xl:grid-cols-2">
    <div>
      <h4 class="mb-4">
        {{ mapTitle }}
      </h4>
      <span v-if="isLoadingDataBySite">Loading...</span>
      <span v-else-if="isErrorDataBySite">Error</span>
      <map-base-component
        v-else-if="mapDataset"
        :dataset="mapDataset"
        :data-key="selectedTab"
        :loading="isLoadingDataBySite"
        :get-popup-html="getPopupHtml"
        map-export-name="dashboard-map"
        :map-id="`insight-overview-by-site`"
        :map-initial-bounds="mapInitialBounds ?? undefined"
        :map-base-formatter="circleFormatter"
        :map-height="360"
        :style-non-zero="circleStyle"
        class="w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { max } from 'lodash-es'
import type { LngLatBoundsLike } from 'mapbox-gl'
import { type ComputedRef, computed, inject, ref } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientBioKey } from '@/globals'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { useStore } from '~/store'
import { useGetDashboardDataBySite } from './_composables/use-get-visaulizer'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()

interface Tab {
  label: string
  value: string
}

const TAB_VALUES = {
  richness: 'speciesRichness',
  detections: 'detection'
}

const tabs: Tab[] = [
  { label: 'Species Richness', value: TAB_VALUES.richness },
  { label: 'Detections (raw)', value: TAB_VALUES.detections }
]

// Services
const { isLoading: isLoadingDataBySite, isError: isErrorDataBySite, data: dataBySite } = useGetDashboardDataBySite(apiClientBio, store.selectedProject?.id ?? -1)
const richnessMapDataBySite = computed(() => dataBySite.value?.richnessBySite ?? [])
const detectionsMapDataBySite = computed(() => dataBySite.value?.detectionBySite ?? [])
// TODO: add detections data

// UI
const selectedTab = ref(tabs[0].value)

// Map
const mapTitle = computed(() => `Total number of ${selectedTab.value === TAB_VALUES.richness ? 'species' : 'detection'} in each site`)
const mapDataset: ComputedRef<MapDataSet> = computed(() => {
  const data = selectedTab.value === TAB_VALUES.richness ? richnessMapDataBySite.value : detectionsMapDataBySite.value
  return {
      startDate: dayjs(),
      endDate: dayjs(),
      sites: store.projectFilters?.locationSites ?? [],
      data: data
        .map(({ name: siteName, latitude, longitude, value }) => ({
          siteName,
          latitude,
          longitude,
          values: {
            [selectedTab.value]: value
          }
        })),
      maxValues: {
        [selectedTab.value]: max(data.map(d => d.value)) ?? 0
      }
    }
})

const mapInitialBounds: ComputedRef<LngLatBoundsLike | null> = computed(() => {
  const project = store.selectedProject
  if (!project) return null
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
})

const circleFormatter: ComputedRef<MapBaseFormatter> = computed(() => {
  return new CircleFormatterNormalizedWithMin({ maxValueRaw: mapDataset.value.maxValues[selectedTab.value] })
})

const circleStyle = computed(() => {
  const color = store.datasetColors[0] ?? '#EFEFEF'
  return { ...DEFAULT_NON_ZERO_STYLE, color }
})

const getPopupHtml = (datum: MapSiteData, dataKey: string): string => {
  const value = datum.values[dataKey]
  return `<span>${value}</span>`
}
</script>
