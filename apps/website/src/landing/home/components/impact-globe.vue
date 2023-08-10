<template>
  <div>
    <div
      ref="mapRoot"
      class="w-full h-full"
    />
    <!-- TODO: This component is removed for now since we're planning to move it to the side below the impact wording. -->
    <!-- <div -->
    <!--   id="species-legend" -->
    <!--   class="absolute right-16 left-auto bottom-12 p-2 border-1 border-gray-600 rounded-lg text-xs text-gray-300 lg:right-64 xl:right-92 2xl:right-160 3xl:right-160 4xl:right-240" -->
    <!-- > -->
    <!--   <h4 class="font-bold text-xxs mb-1"> -->
    <!--     Species Identified -->
    <!--   </h4> -->
    <!--   <div> -->
    <!--     <span -->
    <!--       class="rounded inline-block h-2 w-2 mr-1" -->
    <!--       style="background-color: rgb(240,30,61)" -->
    <!--     />100+ -->
    <!--   </div> -->
    <!--   <div> -->
    <!--     <span -->
    <!--       class="rounded inline-block h-2 w-2 mr-1" -->
    <!--       style="background-color: rgb(255,104,104)" -->
    <!--     />10+ -->
    <!--   </div> -->
    <!--   <div> -->
    <!--     <span -->
    <!--       class="rounded inline-block h-2 w-2 mr-1" -->
    <!--       style="background-color: rgb(255,175,175)" -->
    <!--     />1+ -->
    <!--   </div> -->
    <!-- </div> -->
    <div
      v-if="isAllowConfig && false"
      class="relative bottom-0 right-0"
    >
      <heatmap-config
        label="radius"
        :min-value="0"
        :max-value="200"
        :default-config="circleRadiusParams"
        class="absolute bottom-25 right-2"
        @emit-config-change="(value) => { circleRadiusParams = value }"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Feature, FeatureCollection, Point } from 'geojson'
import type { Expression, Map as MapboxMap, MapboxOptions } from 'mapbox-gl'
import { Popup } from 'mapbox-gl'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'

import { togglesKey } from '@/globals'
import { createMap } from '~/maps'
import HeatmapConfig from '~/maps/heatmap-config/heatmap-config.vue'
import type { HeatmapCustomByZoom } from '~/maps/utils/heatmap-style/style-to-paint'
import data from './globe-species.json'

const toggles = inject(togglesKey)
const isAllowConfig = computed(() => toggles?.heatmapConfig === true)
const circleRadiusParams = ref<HeatmapCustomByZoom>([1, 1, 7, 8])
const circleRadius = computed(() => (['interpolate', ['linear'], ['log10', ['get', 'recordedMinutes']]] as (number | string | (string | string[]))[]).concat(circleRadiusParams.value))
watch(circleRadius, (newValue) => {
  map.setPaintProperty('species-point', 'circle-radius', newValue)
}, { deep: true })

defineProps({
  selectedVisualization: { type: String, default: undefined }
})

const mapRoot = ref<InstanceType<typeof HTMLElement> | null>(null)

const mapConfig: Omit<MapboxOptions, 'container'> = {
  style: 'mapbox://styles/mapbox/satellite-v9',
  projection: { name: 'globe' },
  zoom: 1.8,
  center: [-75.5, 1.2],
  attributionControl: false
}

const fog = {
  color: 'rgb(186, 210, 235)', // Lower atmosphere
  'high-color': '#060508', // Upper atmosphere
  'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
  'space-color': '#060508', // Background color
  'star-intensity': 0 // Background star brightness (default 0.35 at low zoooms)
}

let map!: MapboxMap

onMounted(() => {
  map = createMap({ ...mapConfig, container: mapRoot.value as HTMLElement })
    .on('style.load', () => {
      map.setFog(fog)
    })
    .on('load', () => {
      showSpecies(map)
    })
  map.scrollZoom.disable()
  map.keyboard.disableRotation()
  map.touchZoomRotate.disableRotation()
  map.touchPitch.disable()

  // At low zooms, complete a revolution every two minutes.
  const secondsPerRevolution = 90
  // Above zoom level 5, do not rotate.
  const maxSpinZoom = 5
  // Rotate at intermediate speeds between zoom levels 3 and 5.
  const slowSpinZoom = 3

  let userInteracting = false
  const spinEnabled = true

  function spinGlobe () {
    const zoom = map.getZoom()
    if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
      let distancePerSecond = 360 / secondsPerRevolution
      if (zoom > slowSpinZoom) {
        // Slow spinning at higher zooms
        const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom)
        distancePerSecond *= zoomDif
      }
      const center = map.getCenter()
      center.lng += distancePerSecond
      // Smoothly animate the map over one second.
      // When this animation is complete, it calls a 'moveend' event.
      map.easeTo({ center, duration: 1000, easing: (n) => n })
    }
  }

  // Pause spinning on interaction
  map.on('mousedown', () => {
    userInteracting = true
  })

  // Restart spinning the globe when interaction is complete
  map.on('mouseup', () => {
    userInteracting = false
    spinGlobe()
  })

  // These events account for cases where the mouse has moved
  // off the map, so 'mouseup' will not be fired.
  map.on('dragend', () => {
    userInteracting = false
    spinGlobe()
  })
  map.on('pitchend', () => {
    userInteracting = false
    spinGlobe()
  })
  map.on('rotateend', () => {
    userInteracting = false
    spinGlobe()
  })

  // When animation is complete, start spinning if there is no ongoing interaction
  map.on('moveend', () => {
    spinGlobe()
  })

  spinGlobe()

  const popup = new Popup({
      closeButton: false,
      closeOnClick: false
  })

  map.on('mouseenter', 'species-point', function (e) {
      map.getCanvas().style.cursor = 'pointer'
      const feature = e.features?.at(0) as Feature
      const coordinates = (feature.geometry as Point).coordinates.slice()
      const text = `${feature.properties?.species.toLocaleString()} unique species identified in ${feature.properties?.recordedMinutes.toLocaleString()} recorded minutes`
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }
      popup.setLngLat([coordinates[0], coordinates[1]]).setText(text).addTo(map)
  })

  map.on('mouseleave', 'species-point', function () {
      map.getCanvas().style.cursor = ''
      popup.remove()
  })
})

onUnmounted(() => {
  map.remove()
})

function toGeojson (data: Array<{latitude: number, longitude: number, total_species: number, total_recorded_minutes: number}>): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: data.map(({ latitude, longitude, total_recorded_minutes: recordedMinutes, total_species: species }) => ({ type: 'Feature', properties: { recordedMinutes, species }, geometry: { type: 'Point', coordinates: [longitude, latitude] } }))
  }
}

function showSpecies (map: MapboxMap) {
  // For finding out ranges (might want to make this part of the calculation?)
  // console.log('species max', Math.max(...data.map(d => d.total_species)))
  // console.log('species mean', data.map(d => d.total_species).reduce((a, c) => a + c, 0) / data.length)
  // console.log('recs max', Math.max(...data.map(d => d.total_recorded_minutes)))
  // console.log('recs mean', data.map(d => d.total_recorded_minutes).reduce((a, c) => a + c, 0) / data.length)
  // console.log('recs max', Math.max(...data.map(d => Math.log10(d.total_recorded_minutes))))
  // console.log('recs mean', data.map(d => Math.log10(d.total_recorded_minutes)).reduce((a, c) => a + c, 0) / data.length)

  map.addSource('species', {
    type: 'geojson',
    data: toGeojson(data.filter(d => d.total_species !== 0))
  })
  map.addLayer({
      id: 'species-point',
      type: 'circle',
      source: 'species',
      paint: {
        // Size circle radius by earthquake magnitude and zoom level
        'circle-radius': circleRadius.value as Expression,
        // Color circle by earthquake magnitude
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'species'],
          // 0,
          // 'rgba(255,175,175,0)',
          1,
          'rgb(255,175,175)',
          10,
          'rgb(255,104,104)',
          100,
          'rgb(240,30,61)'
        ],
        'circle-stroke-color': 'rgba(255,175,175,0.3)',
        'circle-stroke-width': 1
      }
    })
}
</script>
<style>
.mapboxgl-popup {
  max-width: 400px;
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  color: #000;
}
</style>
