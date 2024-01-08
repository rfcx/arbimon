<template>
  <div class="mt-10 md:mt-20">
    <h2>Species Richness</h2>
    <h6 class="mb-4">
      Number of species detected per site
    </h6>
    <div class="flex flex-row gap-2">
      <div class="items-center inline-flex  gap-2">
        Filter by:
        <taxon-filter
          :available-taxon-classes="availableTaxons"
          @emit-taxon-class-filter="onEmitTaxonClassFilter"
        />
      </div>
      <div class="items-center inline-flex gap-2">
        Map type:
        <div>
          <button
            id="mapTypeDropdown"
            data-dropdown-toggle="mapDropdown"
            class="border-1 border-frequency rounded-full bg-moss text-frequency px-3 py-2 flex items-center gap-2"
            type="button"
          >
            {{ mapStyleLable }}
            <span class="pl-3">
              <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
              <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
            </span>
          </button>
          <div
            id="mapDropdown"
            class="z-10 hidden bg-moss border-1 border-frequency rounded-lg"
          >
            <ul
              aria-labelledby="mapTypeDropdown"
              class="p-2 flex flex-col font-medium"
            >
              <li
                v-for="mapStyle in mapStatisticsDisplayStyleOptions"
                :key="mapStyle.name"
                v-modal="mapStatisticsStyle"
                class="bg-moss text-frequency px-3 py-2 flex items-center gap-2"
                :class="mapStyleLable === mapStyle.name ? 'border-1 border-frequency rounded-full' : ''"
                @click="propagateMapStatisticsStyle(mapStyle.style)"
              >
                <el-tag
                  class="species-highlights items-center border-none cursor-pointer text-md select-none h-6 bg-moss"
                  size="large"
                  :title="mapStyle"
                >
                  {{ mapStyle.name }}
                </el-tag>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="inline-grid w-full mt-4">
    <div>
      <span v-if="isLoadingDataBySite">Loading...</span>
      <span v-else-if="isErrorDataBySite">Error</span>
      <map-base-component
        v-else-if="mapDataset"
        :dataset="mapDataset"
        :data-key="MAP_KEY"
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
          :max-value="mapDataset.maxValues[MAP_KEY]"
          :title="`Number of species`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { initDropdowns } from 'flowbite'
import { groupBy, max, sum } from 'lodash-es'
import type { LngLatBoundsLike } from 'mapbox-gl'
import { type ComputedRef, type Ref, computed, inject, onMounted, ref } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientKey } from '@/globals'
import { type MapboxStatisticsStyle, type MapboxStyle, MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_HEATMAP } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import CircleLegend from '~/maps/map-legend/circle-legend.vue'
import HeatmapLegend from '~/maps/map-legend/heatmap-legend.vue'
import type { MapOptions } from '~/maps/map-tool-menu/types'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { useStore } from '~/store'
import { useGetDashboardDataBySite } from './_composables/use-get-visaulizer'
import TaxonFilter from './components/taxon-filter.vue'

const apiClientBio = inject(apiClientKey) as AxiosInstance
const store = useStore()

const MAP_KEY = 'speciesRichness'

onMounted(() => {
  initDropdowns()
})

// Services
const selectedProjectId = computed(() => store.selectedProject?.id ?? -1)
const { isLoading: isLoadingDataBySite, isError: isErrorDataBySite, data: dataBySite } = useGetDashboardDataBySite(apiClientBio, selectedProjectId)

// UI
const selectedTaxons: Ref<number[] | null> = ref(null)

// Map
const mapStatisticsDisplayStyleOptions: MapOptions[] = [
  { style: MAPBOX_STYLE_HEATMAP, name: 'Heatmap', icon: new URL('./icons/heatmap.svg', import.meta.url).toString() },
  { style: MAPBOX_STYLE_CIRCLE, name: 'Point map', icon: new URL('./icons/bubble.svg', import.meta.url).toString() }
]
const mapStatisticsStyle = ref<MapboxStatisticsStyle>(MAPBOX_STYLE_CIRCLE)
const mapStyleLable = ref<string>(mapStatisticsDisplayStyleOptions[1].name)

const filteredByTaxon = computed(() => {
  const data = dataBySite.value?.richnessBySite ?? []
  const filtered = selectedTaxons.value === null ? data : data.filter(d => selectedTaxons.value?.includes(d.taxonClassId ?? 0))
  const groupedBySite = groupBy(filtered, 'name')
  const locationSites = Object.keys(groupedBySite)
  return locationSites.map(name => {
    return {
      name,
      latitude: groupedBySite[name][0].latitude,
      longitude: groupedBySite[name][0].longitude,
      value: sum(groupedBySite[name].map(d => d.value))
    }
  })
})

const availableTaxons = computed(() => {
  const data = dataBySite.value?.richnessBySite ?? []
  return [...new Set(data.map(d => `${d.taxonClassId ?? 0}`))]
})

const mapDataset: ComputedRef<MapDataSet> = computed(() => {
  const data = filteredByTaxon.value
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
            [MAP_KEY]: value
          }
        })),
      maxValues: {
        [MAP_KEY]: max(data.map(d => d.value)) ?? 0
      }
    }
})

const propagateMapStatisticsStyle = (style: MapboxStyle) => {
  mapStatisticsStyle.value = style as MapboxStatisticsStyle
  if (style === MAPBOX_STYLE_CIRCLE) {
    mapStyleLable.value = mapStatisticsDisplayStyleOptions[1].name
  } else {
    mapStyleLable.value = mapStatisticsDisplayStyleOptions[0].name
  }
}

const mapInitialBounds: ComputedRef<LngLatBoundsLike | null> = computed(() => {
  const project = store.selectedProject
  if (!project) return null
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
})

const circleFormatter: ComputedRef<MapBaseFormatter> = computed(() => {
  return new CircleFormatterNormalizedWithMin({ maxValueRaw: mapDataset.value.maxValues[MAP_KEY] })
})

const circleStyle = computed(() => {
  const color = store.datasetColors[0] ?? '#EFEFEF'
  return { ...DEFAULT_NON_ZERO_STYLE, color }
})

const getPopupHtml = (datum: MapSiteData, dataKey: string): string => {
  const value = datum.values[dataKey]
  return `<span>${value}</span>`
}

// Filter
const onEmitTaxonClassFilter = (taxonClassIds: string[]) => {
  selectedTaxons.value = taxonClassIds.map(id => parseInt(id))
}

</script>

<style lang="scss">
.el-input__wrapper {
  border-radius: 8px;
  border: 1px solid #F9F6F2;
  background: #060508;
}
.el-input__inner {
  padding-left: 2px !important;
}
</style>
