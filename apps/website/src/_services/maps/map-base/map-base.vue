<template>
  <div>
    <no-data-panel
      v-if="!hasData"
      :style="{ height: `${mapHeight}px` }"
    />
    <div
      v-show="hasData"
      class="relative"
    >
      <div
        :id="props.mapId"
        class="w-full text-black"
        :style="{ height: `${props.mapHeight}px` }"
      />
      <div
        v-if="dataset.title"
        class="absolute text-lg bg-white top-2 left-2"
      >
        {{ dataset.title }}
      </div>
      <export-button
        class="absolute top-2 right-2"
        @click="downloadMapPngInternal()"
      />
      <!-- ! To be remove -->
      <div>
        <div class="absolute top-12 right-2">
          <label for="weight">weight:</label>
          <input
            id="weight"
            v-model.number="heatmapWeight[0]"
            title="first zoom"
            type="number"
            step="1"
            min="0"
            max="16"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          <input
            v-model.number="heatmapWeight[1]"
            title="first weight"
            type="number"
            min="0"
            max="99"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          :
          <input
            v-model.number="heatmapWeight[2]"
            title="last zoom"
            type="number"
            step="1"
            min="0"
            max="16"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          <input
            v-model.number="heatmapWeight[3]"
            title="last weight"
            type="number"
            min="0"
            max="99"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
        </div>
        <div class="absolute top-20 right-2">
          <label for="intensity">intensity:</label>
          <input
            id="intensity"
            v-model.number="heatmapIntensity[0]"
            title="first zoom"
            type="number"
            step="1"
            min="0"
            max="16"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          <input
            v-model.number="heatmapIntensity[1]"
            title="first intensity"
            type="number"
            min="0"
            max="99"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          :
          <input
            v-model.number="heatmapIntensity[2]"
            title="last zoom"
            type="number"
            step="1"
            min="0"
            max="16"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          <input
            v-model.number="heatmapIntensity[3]"
            title="last intensity"
            type="number"
            min="0"
            max="99"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
        </div>
        <div class="absolute top-28 right-2">
          <label for="radius">radius:</label>
          <input
            id="radius"
            v-model.number="heatmapRadius[0]"
            title="first zoom"
            type="number"
            step="1"
            min="0"
            max="16"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          <input
            v-model.number="heatmapRadius[1]"
            title="first radius"
            type="number"
            min="0"
            max="99"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          :
          <input
            v-model.number="heatmapRadius[2]"
            title="last zoom"
            type="number"
            step="1"
            min="0"
            max="16"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          <input
            v-model.number="heatmapRadius[3]"
            title="last radius"
            type="number"
            min="0"
            max="99"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
        </div>
      </div>
      <!-- ! To be remove -->
    </div>
  </div>
</template>
<script setup lang="ts">
import GeoJSON from 'geojson'
import { partition } from 'lodash-es'
import { AnyPaint, CircleLayer, GeoJSONSource, HeatmapLayer, LngLatBounds, LngLatBoundsLike, Map as MapboxMap, MapboxOptions, NavigationControl, Popup } from 'mapbox-gl'
import { computed, nextTick, onMounted, onUnmounted, ref, watch, withDefaults } from 'vue'

import { createMap, DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_MAP_HEIGHT, LABEL_LAYER_IDS, MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_SATELLITE_STREETS, MapboxGroundStyle, MapboxStatisticsStyle } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '~/maps/constants'
import { downloadMapPng } from '~/maps/functions'
import { MapBaseFormatter, MapBaseStyle, MapDataSet, MapMoveEvent, MapSiteData, StyleToPaint } from '~/maps/types'
import { circleStyleToPaint } from '../utils/circle-style/style-to-paint'
import { HeatmapCustomByZoom, HeatmapOption, heatmapStyleToPaint } from '../utils/heatmap-style/style-to-paint'

const DATA_LAYER_NONZERO_ID = 'species-information-nonzero'
const DATA_LAYER_ZERO_ID = 'species-information-zero'
const DATA_LAYERS = [DATA_LAYER_ZERO_ID, DATA_LAYER_NONZERO_ID]

type popupHtmlFunc = (data: MapSiteData, dataKey: string) => string

const props = withDefaults(defineProps<{
  // Data
  dataset: MapDataSet,
  dataKey: string,
  getPopupHtml: popupHtmlFunc,
  mapExportName: string,

  // Styles
  mapId: string,
  mapBaseFormatter: MapBaseFormatter,

  // Styles (optional)
  mapHeight?: number,
  mapInitialBounds?: LngLatBoundsLike,
  mapGroundStyle?: MapboxGroundStyle,
  mapStatisticsStyle?: MapboxStatisticsStyle,

  styleNonZero?: MapBaseStyle,
  styleZero?: MapBaseStyle,
  isShowLabels?: boolean,

  // Events
  mapMoveEvent?: MapMoveEvent | null
}>(), {
  mapHeight: DEFAULT_MAP_HEIGHT,
  mapInitialBounds: () => [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
  mapGroundStyle: MAPBOX_STYLE_SATELLITE_STREETS,
  mapStatisticsStyle: MAPBOX_STYLE_HEATMAP,
  styleNonZero: () => DEFAULT_NON_ZERO_STYLE,
  styleZero: () => DEFAULT_ZERO_STYLE,
  isShowLabels: true,
  mapMoveEvent: null
})

const emit = defineEmits<{(e: 'emitMapMoved', mapMoveEvent: MapMoveEvent): void}>()

const mapIsLoading = ref(true)
const isSynchronizingMapPosition = ref(false)
const styleToPaint = ref<StyleToPaint<AnyPaint, HeatmapOption>>(heatmapStyleToPaint)
let map!: MapboxMap

const hasData = computed(() => {
  return props.dataset.data.length > 0
})

const mapConfig: MapboxOptions = {
  container: props.mapId,
  style: props.mapGroundStyle,
  bounds: props.mapInitialBounds,
  attributionControl: false,
  preserveDrawingBuffer: true
}

onMounted(() => {
  map = createMap(mapConfig)
    .on('load', () => {
      mapIsLoading.value = false
      generateChartNextTick()
      setupMapPopup()
    })
    .on('style.load', () => {
      generateChartNextTick(false)
    })
    .on('move', () => {
      if (!isSynchronizingMapPosition.value) emitMapMoved()
    })
    .addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
  map.scrollZoom.disable()
  map.dragRotate.disable()
  map.keyboard.disableRotation()
  map.touchZoomRotate.disableRotation()
  map.touchPitch.disable()
})

onUnmounted(() => {
  map.remove()
})

// ! Remove
const dataChanged = ref(true)
const heatmapWeight = ref<HeatmapCustomByZoom>([0, 0, 10, 2])
const heatmapIntensity = ref<HeatmapCustomByZoom>([7, 0.1, 9, 1])
const heatmapRadius = ref<HeatmapCustomByZoom>([0, 1, 10, 20])
watch(() => heatmapWeight.value, () => {
  dataChanged.value = true
  removeLayer(DATA_LAYER_ZERO_ID)
  removeLayer(DATA_LAYER_NONZERO_ID)
  generateChartNextTick(false)
}, { deep: true })
watch(() => heatmapIntensity.value, () => {
  dataChanged.value = true
  removeLayer(DATA_LAYER_ZERO_ID)
  removeLayer(DATA_LAYER_NONZERO_ID)
  generateChartNextTick(false)
}, { deep: true })
watch(() => heatmapRadius.value, () => {
  dataChanged.value = true
  removeLayer(DATA_LAYER_ZERO_ID)
  removeLayer(DATA_LAYER_NONZERO_ID)
  generateChartNextTick(false)
}, { deep: true })
// ! Remove

watch(() => props.mapHeight, () => { generateChartNextTick(); dataChanged.value = true })
watch(() => props.dataset, () => { generateChartNextTick(); dataChanged.value = true }, { deep: true })
watch(() => props.dataKey, () => { generateChartNextTick(false); dataChanged.value = true })
watch(() => props.mapGroundStyle, (currentStyle: MapboxGroundStyle) => map.setStyle(currentStyle))
watch(() => props.mapStatisticsStyle, (currentStyle: MapboxStatisticsStyle) => {
  dataChanged.value = true
  styleToPaint.value = setupPaintStyle(currentStyle)
  removeLayer(DATA_LAYER_ZERO_ID)
  removeLayer(DATA_LAYER_NONZERO_ID)
  generateChartNextTick(false)
})
watch(() => props.mapMoveEvent, () => {
  dataChanged.value = true
  if (!props.mapMoveEvent || props.mapMoveEvent.sourceMapId === props.mapId) return // don't react to self
  isSynchronizingMapPosition.value = true // don't emit for sync'd moves
  map.setCenter(props.mapMoveEvent.center)
  map.setZoom(props.mapMoveEvent.zoom)
  isSynchronizingMapPosition.value = false
})

const emitMapMoved = () => {
  emit('emitMapMoved', { sourceMapId: props.mapId, center: map.getCenter(), zoom: map.getZoom() })
}

const setupPaintStyle = (style: MapboxStatisticsStyle) => {
  switch (style) {
    case 'circle': return circleStyleToPaint
    case 'heatmap': return heatmapStyleToPaint
    default: return circleStyleToPaint
  }
}

const setupMapPopup = () => {
  const popup = new Popup({
    closeButton: false,
    closeOnClick: false
  })

  DATA_LAYERS.forEach(layerId => {
    map.on('mouseenter', layerId, (e) => {
      const coordinates = (e.features?.[0].geometry as GeoJSON.Point | undefined)?.coordinates.slice() as [number, number] | undefined
      const description = e.features?.[0].properties?.popup as string | undefined
      if (!coordinates || !description) return

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      map.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(coordinates).setHTML(description).addTo(map)
    })

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
  })
}

const getPopup = (datum: MapSiteData): string => {
  const value = props.getPopupHtml(datum, props.dataKey)
  return `<strong>${datum.siteName}${value ? ': ' : ''}</strong>${value}`
}

const generateChartNextTick = (rezoom = true) => {
  void nextTick(() => generateChart(rezoom))
}

const generateChart = (rezoom = true) => {
  if (mapIsLoading.value || !hasData.value || !dataChanged.value) return

  map.resize()
  updateDataSourcesAndLayers()
  updateLabels()
  if (rezoom) { void nextTick(() => zoomMap()) }
  dataChanged.value = false
}

const updateDataSourcesAndLayers = () => {
  const [rawNonZero, rawZero] = partition(props.dataset.data, d => d.values[props.dataKey] === true || d.values[props.dataKey] > 0)

  if (props.mapStatisticsStyle !== MAPBOX_STYLE_HEATMAP) {
    updateDataSourceAndLayer(DATA_LAYER_ZERO_ID, rawZero, { ...styleToPaint.value(props.styleZero) })
  }
  updateDataSourceAndLayer(DATA_LAYER_NONZERO_ID, rawNonZero, { ...styleToPaint.value(props.styleNonZero, { heatmapIntensity: heatmapIntensity.value, heatmapWeight: heatmapWeight.value, heatmapRadius: heatmapRadius.value }) })
}

const updateDataSourceAndLayer = (id: string, mapData: MapSiteData[], paint: AnyPaint) => {
  // Define map data
  const data: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: 'FeatureCollection',
    features: mapData.map(datum => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [datum.longitude, datum.latitude] },
      properties: {
        title: datum.siteName,
        radius: props.mapBaseFormatter.getRadius(Number(datum.values[props.dataKey])), // TODO Remove this once boolean is removed from type
        popup: getPopup(datum)
      }
    }))
  }

  // Add source
  const source = map.getSource(id) as GeoJSONSource | undefined
  if (source === undefined) {
    map.addSource(id, { type: 'geojson', data })
  } else {
    source.setData(data)
  }

  // Add layer
  const layer = map.getLayer(id) as CircleLayer | HeatmapLayer | undefined
  if (layer !== undefined) return

  // @ts-expect-error map type and paint not matched
  map.addLayer({ id, type: props.mapStatisticsStyle, source: id, paint })
}

const updateLabels = () => {
  const targetVisibility = props.isShowLabels ? 'visible' : 'none'
  map.getStyle().layers
    ?.map(layer => layer.id)
    ?.filter(id => LABEL_LAYER_IDS.includes(id))
    ?.forEach(id => map.setLayoutProperty(id, 'visibility', targetVisibility))
}

const zoomMap = () => {
  const coordinates: Array<[number, number]> = props.dataset.data.map(datum => [datum.longitude, datum.latitude] as [number, number])
  if (coordinates.length === 0) return
  const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new LngLatBounds(coordinates[0], coordinates[0]))
  map.fitBounds(bounds, { padding: 40, maxZoom: 15 })
}

const removeLayer = (id: string) => {
  const layer = map.getLayer(id) as CircleLayer | HeatmapLayer | undefined
  if (layer !== undefined) map.removeLayer(id)
}

const downloadMapPngInternal = async () => {
  const legendEntry = props.mapStatisticsStyle !== MAPBOX_STYLE_HEATMAP ? props.mapBaseFormatter.getLegendEntries(props.styleNonZero, props.styleZero) : undefined
  await downloadMapPng(map, `${props.mapExportName}-${props.mapStatisticsStyle}`, legendEntry)
}
</script>
