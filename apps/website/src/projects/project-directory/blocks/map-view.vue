<template>
  <div
    ref="mapRoot"
    class="w-full h-full"
    :style="{ height: `95vh` }"
  />
</template>
<script setup lang="ts">
import type { Map as MapboxMap, MapboxOptions } from 'mapbox-gl'
import { onMounted, ref } from 'vue'

import { createMap } from '~/maps'

const mapConfig: MapboxOptions = {
  style: 'mapbox://styles/mapbox/satellite-streets-v11',
  // center: [-75.5, 1.2],
  attributionControl: false,
  container: 'mapRoot',
  // bounds: props.mapInitialBounds,
  preserveDrawingBuffer: true
}

const mapRoot = ref<InstanceType<typeof HTMLElement> | null>(null)

let map!: MapboxMap
onMounted(() => {
  map = createMap({ ...mapConfig, container: mapRoot.value as HTMLElement })
  map.scrollZoom.enable()
})
</script>
