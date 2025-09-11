<template>
  <div
    class="w-full"
  >
    <section-title>
      <template #title>
        <div class="flex flex-col md:(flex-row items-center) text-subtle gap-2">
          <select
            v-model="selectedType"
            class="text-xl py-1 bg-echo font-header border-t-0 border-l-0 border-r-0 border-b-1 border-dashed cursor-pointer focus:(border-box-gray border-t-0 border-l-0 border-r-0 border-b-1 ring-0 outline-none)"
          >
            <option
              v-for="item in datasetTypes"
              :key="'detection-location-selector' + item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
          <h2 class="text-xl ml-1">
            by location
          </h2>
        </div>
      </template>
      <template #controls>
        <map-tool-menu-component
          :map-ground-style="mapGroundStyle"
          :map-statistics-style="mapStatisticsStyle"
          @emit-map-ground-style="propagateMapGroundStyle"
          @emit-map-statistics-style="propagateMapStatisticsStyle"
          @emit-show-labels-toggle="propagateToggleLabels"
        />
      </template>
    </section-title>
    <div
      v-for="(dataset, idx) in datasets"
      :key="'activity-patterns-by-location-wrapper' + idx"
      class="grid gap-2 mt-2"
      :class="{ [`md:grid-cols-${columnCount}`]: true }"
    >
      <map-base-component
        :key="'activity-patterns-by-location-' + idx"
        :dataset="dataset"
        :data-key="selectedType"
        :loading="loading"
        :get-popup-html="getPopupHtml"
        :map-export-name="mapExportName(dataset, selectedType, idx)"
        :map-id="`activity-patterns-by-location-${idx}`"
        :map-initial-bounds="mapInitialBounds"
        :map-base-formatter="circleFormatter"
        :map-ground-style="mapGroundStyle"
        :map-statistics-style="mapStatisticsStyle"
        :is-show-labels="isShowLabels"
        :style-non-zero="circleStyles[idx]"
        :map-move-event="mapMoveEvent"
        class="w-full"
        @emit-map-moved="propagateMapMove"
      />
      <div class="flex flex-row justify-between mt-4">
        <circle-legend
          v-if="mapStatisticsStyle === MAPBOX_STYLE_CIRCLE && !loading"
          :map-base-formatter="circleFormatter"
          :style-non-zero="circleStyles[idx]"
          :is-integer-label="selectedType === SPOTLIGHT_MAP_KEYS.detectionFrequency ? false : true"
        />
        <heatmap-legend
          v-else-if="mapStatisticsStyle === MAPBOX_STYLE_HEATMAP && !loading"
          :max-value="selectedType === SPOTLIGHT_MAP_KEYS.detectionFrequency ? dataset.maxValues.detectionFrequency : dataset.maxValues.count"
          :title="selectedType === SPOTLIGHT_MAP_KEYS.detectionFrequency ? 'Detection frequency' : 'Number of species'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LngLatBoundsLike } from 'mapbox-gl'
import { type Ref, computed, ref } from 'vue'

import type { SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import { SPOTLIGHT_MAP_KEYS } from '@/insights/activity-patterns/functions'
import { getExportFilterName } from '~/filters'
import type { MapboxGroundStyle, MapboxStatisticsStyle, MapboxStyle } from '~/maps'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_SATELLITE_STREETS } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import MapBaseComponent from '~/maps/map-base/map-base.vue'
import CircleLegend from '~/maps/map-legend/circle-legend.vue'
import HeatmapLegend from '~/maps/map-legend/heatmap-legend.vue'
import MapToolMenuComponent from '~/maps/map-tool-menu/map-tool-menu.vue'
import type { MapBaseFormatter, MapDataSet, MapMoveEvent } from '~/maps/types'
import { CircleFormatterBinary } from '~/maps/utils/circle-formatter/circle-formatter-binary'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import type { CircleStyle } from '~/maps/utils/circle-style/types'
import { useStore } from '~/store'
import { generateDetectionHtmlPopup } from './functions'

const store = useStore()

const props = withDefaults(defineProps<{ species: SpeciesInProjectTypes['light'] | null, datasets: MapDataSet[], loading: boolean }>(), {
  datasets: () => [],
  loading: false
})

const DEFAULT_PREFIX = 'Spotlight-By-Site'

const selectedType = ref(SPOTLIGHT_MAP_KEYS.detectionFrequency)
const datasetTypes = ref<Array<{ label: string, value: string }>>([
  { label: 'Detection Frequency', value: SPOTLIGHT_MAP_KEYS.detectionFrequency },
  { label: 'Detections (raw)', value: SPOTLIGHT_MAP_KEYS.count },
  { label: 'Naive Occupancy', value: SPOTLIGHT_MAP_KEYS.occupancy }
])
const isShowLabels = ref(true)
const mapGroundStyle: Ref<MapboxGroundStyle> = ref(MAPBOX_STYLE_SATELLITE_STREETS)
const mapStatisticsStyle: Ref<MapboxStatisticsStyle> = ref(MAPBOX_STYLE_HEATMAP)
const getPopupHtml = ref(generateDetectionHtmlPopup)

const mapMoveEvent: Ref<MapMoveEvent | null> = ref(null)

const columnCount = computed(() => {
  switch (props.datasets.length) {
    case 1: return 1
    default: return 2
  }
})

const mapInitialBounds = computed<LngLatBoundsLike>(() => {
  if (store.project == null) {
    return [DEFAULT_LONGITUDE, DEFAULT_LATITUDE]
  }

  return [
    [store.project.longitudeWest, store.project.latitudeSouth],
    [store.project.longitudeEast, store.project.latitudeNorth]
  ]
})

const circleFormatter = computed<MapBaseFormatter>(() => {
  return selectedType.value === SPOTLIGHT_MAP_KEYS.occupancy
    ? new CircleFormatterBinary()
    : new CircleFormatterNormalizedWithMin({ maxValueRaw: props.datasets[0].maxValues[selectedType.value], showZeroInLegend: true })
})

const circleStyles = computed<CircleStyle[]>(() => {
  return props.datasets.map((_, idx) => {
    return {
      ...DEFAULT_NON_ZERO_STYLE,
      color: store.datasetColors[idx]
    }
  })
})

const propagateMapMove = (mapMove: MapMoveEvent): void => {
  if (props.datasets.length > 1 && mapMoveEvent.value !== null) {
    // only adjust zoom level for multi-dataset maps
    mapMoveEvent.value.zoom = 10
  } else {
    mapMoveEvent.value = mapMove
  }
}

const propagateMapGroundStyle = (style: MapboxStyle): void => {
  // @ts-expect-error the type mismatch but the given type is just only the subset so this should be fine.
  mapGroundStyle.value = style
}
const propagateMapStatisticsStyle = (style: MapboxStyle): void => {
  // @ts-expect-error the type mismatch but the given type is just only the subset so this should be fine.
  mapStatisticsStyle.value = style
}
const propagateToggleLabels = (showLabels: boolean): void => { isShowLabels.value = showLabels }

const mapExportName = (dataset: MapDataSet, type: string, datasetIndex: number): string => {
  const { startDate, endDate, sites } = dataset
  const siteGroup = sites.map(s => ({ label: s.name, value: [s] }))

  return getExportFilterName(startDate, endDate, `${DEFAULT_PREFIX}-${type}--${props.species?.taxonSpeciesSlug ?? ''}`, datasetIndex, undefined, siteGroup)
}
</script>
