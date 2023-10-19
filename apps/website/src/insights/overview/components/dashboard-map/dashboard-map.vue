<template>
  <h2>Species Richness</h2>
  <div class="inline-grid w-full">
    <div>
      <h6 class="mb-4">
        Number of species detected per site
      </h6>
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
        :map-height="500"
        :style-non-zero="circleStyle"
        class="map-bubble w-full"
      />
      <div class="flex flex-row justify-between mt-4">
        <circle-legend
          v-if="mapStatisticsStyle === MAPBOX_STYLE_CIRCLE"
          :map-base-formatter="circleFormatter"
          :style-non-zero="circleStyle"
        />
        <heatmap-legend
          v-else-if="mapStatisticsStyle === MAPBOX_STYLE_HEATMAP"
          :max-value="mapDataset.maxValues[selectedTab.value]"
          :title="`Number of ${selectedTab.shortName}`"
        />
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
import { type MapboxStatisticsStyle, type MapboxStyle, MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_HEATMAP } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import CircleLegend from '~/maps/map-legend/circle-legend.vue'
import HeatmapLegend from '~/maps/map-legend/heatmap-legend.vue'
import MapToolMenu from '~/maps/map-tool-menu/map-tool-menu.vue'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { useStore } from '~/store'
import { type TabValue, TAB_VALUES } from '../../types/tabs'
import { useGetDashboardDataBySite } from './_composables/use-get-visaulizer'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()

interface Tab {
  label: string
  shortName: string
  value: TabValue
}

const tabs: Tab[] = [
  { label: 'Species Richness', shortName: 'species', value: TAB_VALUES.richness },
  { label: 'Detections (raw)', shortName: 'detection', value: TAB_VALUES.detections }
]

// Services
const selectedProjectId = computed(() => store.selectedProject?.id ?? -1)
const { isLoading: isLoadingDataBySite, isError: isErrorDataBySite, data: dataBySite } = useGetDashboardDataBySite(apiClientBio, selectedProjectId)
const richnessMapDataBySite = computed(() => dataBySite.value?.richnessBySite ?? [])
const detectionsMapDataBySite = computed(() => dataBySite.value?.detectionBySite ?? [])

// UI
const selectedTab = ref(tabs[0])

// Map
const mapStatisticsStyle = ref<MapboxStatisticsStyle>(MAPBOX_STYLE_CIRCLE)

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

const propagateMapStatisticsStyle = (style: MapboxStyle) => { mapStatisticsStyle.value = style as MapboxStatisticsStyle }

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
