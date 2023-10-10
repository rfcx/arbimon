<template>
  <div class="graphic-tabs mb-10">
    <ol class="text-xl lg:text-2xl xl:text-3xl">
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        class="cursor-pointer inline-block p-2 border-b-2 hover:text-frequency hover:border-frequency font-header font-2xl"
        :class="{ 'text-frequency border-frequency border-b-2': selectedTab.value === tabs[index].value }"
        :aria-selected="selectedTab.value === tabs[index].value"
        :tabindex="index"
        @click="selectedTab = tabs[index]"
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
        :data-key="selectedTab.value"
        :loading="isLoadingDataBySite"
        :get-popup-html="getPopupHtml"
        map-export-name="insight-overview-by-site"
        :map-id="`insight-overview-by-site`"
        :map-initial-bounds="mapInitialBounds ?? undefined"
        :map-base-formatter="circleFormatter"
        :map-statistics-style="mapStatisticsStyle"
        :map-height="360"
        :style-non-zero="circleStyle"
        class="map-bubble w-full"
      />
      <!-- '#4A7BB7', '#98CAE1', '#EAECCC', '#FDB366', '#DD3D2D' -->
      <div class="flex flex-row justify-between mt-4">
        <div
          class="flex gap-y-2 flex-col justify-center min-w-50"
          :class="{
            'invisible': mapStatisticsStyle === MAPBOX_STYLE_CIRCLE,
          }"
        >
          <div
            v-if="mapLegendLabels"
            class="flex"
            :class="`justify-${mapLegendLabels.length === 1 ? 'center' : 'between'}`"
          >
            <span
              v-for="n in mapLegendLabels"
              :key="n"
            >
              {{ n }}
              <span v-if="n === mapLegendLabels[mapLegendLabels.length - 1]">+</span>
            </span>
          </div>
          <span
            v-else
            class="text-fog text-center text-sm"
          >
            No data
          </span>
          <div class="bg-gradient-to-r from-[#4A7BB7] from-20% via-[#98CAE1] via-40% via-[#EAECCC] via-60% via-[#FDB366] via-80% to-[#DD3D2D] to-100% h-2 rounded-full">
            <span class="invisible">Legend</span>
          </div>
          <div class="text-center">
            Number of {{ selectedTab.shortName }}
          </div>
        </div>
        <map-tool-menu
          :map-statistics-style="mapStatisticsStyle"
          :map-ground-style="undefined"
          :can-toggle-labels="false"
          @emit-map-statistics-style="propagateMapStatisticsStyle"
        />
      </div>
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
import { type MapboxStatisticsStyle, MAPBOX_STYLE_CIRCLE } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import MapToolMenu from '~/maps/map-tool-menu/map-tool-menu.vue'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { useStore } from '~/store'
import { useGetDashboardDataBySite } from './_composables/use-get-visaulizer'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()

interface Tab {
  label: string
  shortName: string
  value: string
}

const TAB_VALUES = {
  richness: 'speciesRichness',
  detections: 'detection'
}

const tabs: Tab[] = [
  { label: 'Species Richness', shortName: 'species', value: TAB_VALUES.richness },
  { label: 'Detections (raw)', shortName: 'detection', value: TAB_VALUES.detections }
]

// Services
const { isLoading: isLoadingDataBySite, isError: isErrorDataBySite, data: dataBySite } = useGetDashboardDataBySite(apiClientBio, store.selectedProject?.id ?? -1)
const richnessMapDataBySite = computed(() => dataBySite.value?.richnessBySite ?? [])
const detectionsMapDataBySite = computed(() => dataBySite.value?.detectionBySite ?? [])
// TODO: add detections data

// UI
const selectedTab = ref(tabs[0])

// Map
const mapStatisticsStyle = ref<MapboxStatisticsStyle>(MAPBOX_STYLE_CIRCLE)
const mapTitle = computed(() => `Total number of ${selectedTab.value.shortName} in each site`)
const mapDataset: ComputedRef<MapDataSet> = computed(() => {
  const data = selectedTab.value.value === TAB_VALUES.richness ? richnessMapDataBySite.value : detectionsMapDataBySite.value
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
            [selectedTab.value.value]: value
          }
        })),
      maxValues: {
        [selectedTab.value.value]: max(data.map(d => d.value)) ?? 0
      }
    }
})
const mapLegendLabels = computed(() => {
  const maxValue = Math.max(mapDataset.value.maxValues[selectedTab.value.value], 10)
  if (maxValue === 0) return null
  return [1, Math.ceil(maxValue / 2), maxValue]
})

const propagateMapStatisticsStyle = (style: MapboxStatisticsStyle) => {
  mapStatisticsStyle.value = style
}

const mapInitialBounds: ComputedRef<LngLatBoundsLike | null> = computed(() => {
  const project = store.selectedProject
  if (!project) return null
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
})

const circleFormatter: ComputedRef<MapBaseFormatter> = computed(() => {
  return new CircleFormatterNormalizedWithMin({ maxValueRaw: mapDataset.value.maxValues[selectedTab.value.value] })
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
