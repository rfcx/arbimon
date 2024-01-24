<template>
  <div class="items-center inline-flex gap-2">
    Map type:
    <div>
      <button
        id="mapTypeDropdown"
        data-dropdown-toggle="mapDropdown"
        class="border-1 border-frequency rounded-full bg-moss text-frequency px-3 py-2 flex items-center gap-2"
        type="button"
      >
        {{ mapStyleLabel }}
        <span>
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
            :class="mapStyleLabel === mapStyle.name ? 'border-1 border-frequency rounded-full' : ''"
            @click="propagateMapStatisticsStyle(mapStyle.style)"
          >
            <div
              class="species-highlights items-center border-none cursor-pointer text-md select-none h-6 bg-moss"
              size="large"
            >
              {{ mapStyle.name }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import { onMounted, ref } from 'vue'

import { type MapboxStatisticsStyle, type MapboxStyle, MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_HEATMAP } from '~/maps'
import type { MapOptions } from '~/maps/map-tool-menu/types'

const emit = defineEmits<{(e: 'emitMapStyle', style: MapboxStatisticsStyle): void}>()
const mapStatisticsDisplayStyleOptions: MapOptions[] = [
  { style: MAPBOX_STYLE_HEATMAP, name: 'Heatmap', icon: new URL('./icons/heatmap.svg', import.meta.url).toString() },
  { style: MAPBOX_STYLE_CIRCLE, name: 'Point map', icon: new URL('./icons/bubble.svg', import.meta.url).toString() }
]
const mapStatisticsStyle = ref<MapboxStatisticsStyle>(MAPBOX_STYLE_CIRCLE)
const mapStyleLabel = ref<string>(mapStatisticsDisplayStyleOptions[1].name)
let dropdown: Dropdown

onMounted(() => {
  initDropdowns()
  dropdown = new Dropdown(
    document.getElementById('mapDropdown'),
    document.getElementById('mapTypeDropdown')
  )
})

const propagateMapStatisticsStyle = (style: MapboxStyle) => {
  mapStatisticsStyle.value = style as MapboxStatisticsStyle
  if (style === MAPBOX_STYLE_CIRCLE) {
    mapStyleLabel.value = mapStatisticsDisplayStyleOptions[1].name
  } else {
    mapStyleLabel.value = mapStatisticsDisplayStyleOptions[0].name
  }
  dropdown.hide()
  emit('emitMapStyle', mapStatisticsStyle.value)
}

</script>
