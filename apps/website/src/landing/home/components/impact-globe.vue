<template>
  <div ref="mapRoot" />
</template>
<script setup lang="ts">
import type { Map as MapboxMap, MapboxOptions } from 'mapbox-gl'
import { onMounted, onUnmounted, ref } from 'vue'

import { createMap } from '~/maps'

defineProps({
  selectedVisualization: { type: String, default: undefined }
})

const mapRoot = ref<InstanceType<typeof HTMLElement> | null>(null)

const mapConfig: Omit<MapboxOptions, 'container'> = {
  style: 'mapbox://styles/mapbox/satellite-v9',
  projection: { name: 'globe' },
  zoom: 1.8,
  center: [-90, 40],
  attributionControl: false
}

const fog = {
  color: 'rgb(186, 210, 235)', // Lower atmosphere
  'high-color': '#243c84', // Upper atmosphere
  'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
  'space-color': '#141525', // Background color
  'star-intensity': 0 // Background star brightness (default 0.35 at low zoooms)
}

let map!: MapboxMap

onMounted(() => {
  map = createMap({ ...mapConfig, container: mapRoot.value as HTMLElement })
    .on('style.load', () => {
      map.setFog(fog)
    })
  map.scrollZoom.disable()
  map.keyboard.disableRotation()
  map.touchZoomRotate.disableRotation()
  map.touchPitch.disable()
})

onUnmounted(() => {
  map.remove()
})
</script>
