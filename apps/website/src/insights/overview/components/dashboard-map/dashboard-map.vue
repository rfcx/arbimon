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
      <div>
        <map-style-options
          @emit-map-style="onMapStyleChange"
        />
      </div>
    </div>
  </div>
  <div class="inline-grid w-full mt-4">
    <div>
      <div
        v-if="isLoadingDataBySite"
        class="loading-shimmer w-full rounded h-[32rem]"
      >
      &nbsp;
      </div>
      <div
        v-else-if="isErrorDataBySite"
        class="flex items-center w-full h-[32rem]"
      >
        <div class="relative w-full max-w-md max-h-full mx-auto">
          <div class="relative p-5 rounded-lg shadow bg-util-gray-04 border border-util-gray-02">
            <div class="flex flex-col">
              <div class="mt-2 w-full text-insight whitespace-pre-line">
                <p>
                  It seems the section didn’t load as expected. <br>
                  Please refresh your browser to give it another go.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
          v-if="mapStatisticsStyle === MAPBOX_STYLE_CIRCLE && !isLoadingDataBySite"
          :map-base-formatter="circleFormatter"
          :style-non-zero="circleStyle"
        />
        <heatmap-legend
          v-else-if="mapStatisticsStyle === MAPBOX_STYLE_HEATMAP && !isLoadingDataBySite"
          :max-value="mapDataset.maxValues[MAP_KEY]"
          :title="`Number of species`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { groupBy, max, sum } from 'lodash-es'
import type { LngLatBoundsLike } from 'mapbox-gl'
import { type ComputedRef, type Ref, computed, inject, ref } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientKey } from '@/globals'
import { type MapboxStatisticsStyle, MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_HEATMAP } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import CircleLegend from '~/maps/map-legend/circle-legend.vue'
import HeatmapLegend from '~/maps/map-legend/heatmap-legend.vue'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { useStore } from '~/store'
import { useGetDashboardDataBySite } from './_composables/use-get-visaulizer'
import MapStyleOptions from './components/map-style-options.vue'
import TaxonFilter from './components/taxon-filter.vue'

const apiClientBio = inject(apiClientKey) as AxiosInstance
const store = useStore()

const MAP_KEY = 'speciesRichness'

// Services
const selectedProjectId = computed(() => store.project?.id ?? -1)
const { isLoading: isLoadingDataBySite, isError: isErrorDataBySite, data: dataBySite } = useGetDashboardDataBySite(apiClientBio, selectedProjectId)

// UI
const selectedTaxons: Ref<number[] | null> = ref(null)
const mapStatisticsStyle = ref<MapboxStatisticsStyle>(MAPBOX_STYLE_CIRCLE)

const onMapStyleChange = (style: MapboxStatisticsStyle) => {
  mapStatisticsStyle.value = style
}

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

const mapInitialBounds: ComputedRef<LngLatBoundsLike | null> = computed(() => {
  const project = store.project
  if (!project) return null
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
})

const circleFormatter: ComputedRef<MapBaseFormatter> = computed(() => {
  return new CircleFormatterNormalizedWithMin({ maxValueRaw: mapDataset.value.maxValues[MAP_KEY], showZeroInLegend: false })
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
