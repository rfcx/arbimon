<template>
  <div class="flex">
    <div class="sm:flex">
      <map-style-options
        v-if="props.mapStatisticsStyle"
        :map-options="mapStatisticsDisplayStyleOptions"
        :map-style="props.mapStatisticsStyle"
        @emit-map-style="emitMapStatisticsStyle"
      />
      <map-style-options
        v-if="props.mapGroundStyle"
        :map-options="mapGroundStyleOptions"
        :map-style="props.mapGroundStyle"
        class="sm:ml-2 <sm:mt-2"
        @emit-map-style="emitMapGroundStyle"
      />
    </div>
    <button
      v-if="canToggleLabels"
      class="btn btn-secondary ml-2 py-1 px-2"
      :class="{ '<2xl:(bg-brand-primary btn-icon bg-frequency)': isShowLabel }"
      @click="emitShowLabelsToggle"
    >
      <div class="flex items-center <2xl:hidden">
        <input
          type="checkbox"
          class="mr-2 text-brand-primary focus:(ring-0 outline-none) rounded"
          :checked="isShowLabel"
        >
        Labels
      </div>
      <div class="2xl:hidden">
        <icon-fas-tag
          class="text-xs text-white"
          :class="{ '<2xl:(text-pitch)': isShowLabel }"
        />
      </div>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import type { MapboxStyle } from '~/maps'
import { MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, MAPBOX_STYLE_SATELLITE_STREETS } from '~/maps'
import MapStyleOptions from './map-style-options.vue'
import type { MapOptions } from './types'

const isShowLabel = ref<boolean>(true)

const props = withDefaults(defineProps<{
  readonly mapGroundStyle: MapboxStyle | undefined
  readonly mapStatisticsStyle: MapboxStyle | undefined
  readonly canToggleLabels?: boolean
}>(), {
  canToggleLabels: true
})

const emit = defineEmits<{(e: 'emitMapGroundStyle', style: MapboxStyle): void,
  (e: 'emitMapStatisticsStyle', style: MapboxStyle): void,
  (e: 'emitShowLabelsToggle', show: boolean): void
}>()

const emitMapGroundStyle = (style: MapboxStyle) => {
  emit('emitMapGroundStyle', style)
}

const emitMapStatisticsStyle = (style: MapboxStyle) => {
  emit('emitMapStatisticsStyle', style)
}

const emitShowLabelsToggle = () => {
  isShowLabel.value = !isShowLabel.value
  emit('emitShowLabelsToggle', isShowLabel.value)
}

const mapGroundStyleOptions: MapOptions[] = [
  { style: MAPBOX_STYLE_SATELLITE_STREETS, name: 'Satellite', icon: new URL('./icons/satellite.svg', import.meta.url).toString() },
  { style: MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, name: 'Simple', icon: new URL('./icons/global.svg', import.meta.url).toString() }
]

const mapStatisticsDisplayStyleOptions: MapOptions[] = [
  { style: MAPBOX_STYLE_HEATMAP, name: 'Heatmap', icon: new URL('./icons/heatmap.svg', import.meta.url).toString() },
  { style: MAPBOX_STYLE_CIRCLE, name: 'Point', icon: new URL('./icons/bubble.svg', import.meta.url).toString() }
]

</script>
