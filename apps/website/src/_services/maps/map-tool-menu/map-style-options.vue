<template>
  <template
    v-for="(item, idx) in mapStatisticsDisplayStyleOptions"
    :key="'map-statistics-style-' + item.name"
  >
    <button
      class="btn <md:(btn-icon)"
      :class="{
        'bg-brand-primary': props.mapStatisticsStyle === item.style,
        'rounded-r-none': idx !== mapStatisticsDisplayStyleOptions.length - 1,
        'rounded-l-none': idx !== 0
      }"
      @click="$emit('emitMapStatisticsStyle', item.style)"
    >
      <div class="<lg:hidden">
        {{ item.name }}
      </div>
      <div>
        <img
          class="lg:hidden <lg:visible"
          :src="item.icon"
          width="16"
          height="16"
        >
      </div>
    </button>
  </template>
  <template
    v-for="(item, idx) in mapGroundStyleOptions"
    :key="'map-ground-style-' + item.name"
  >
    <button
      class="btn <md:(btn-icon)"
      :class="{
        'bg-brand-primary': props.mapGroundStyle === item.style,
        'rounded-r-none': idx !== mapGroundStyleOptions.length - 1,
        'rounded-l-none': idx !== 0,
        'ml-2': idx === 0
      }"
      @click="$emit('emitMapGroundStyle', item.style)"
    >
      <div class="<lg:hidden">
        {{ item.name }}
      </div>
      <div>
        <img
          class="lg:hidden <lg:visible"
          :src="item.icon"
          width="16"
          height="16"
        >
      </div>
    </button>
  </template>
</template>
<script setup lang="ts">
import { MAPBOX_STYLE_BUBBLE, MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'

interface MapOptions {
  style: MapboxStyle
  name: string
  icon: string
}

const props = defineProps<{
  readonly mapGroundStyle: MapboxStyle
  readonly mapStatisticsStyle: MapboxStyle
}>()

defineEmits<{(e: 'emitMapGroundStyle', style: MapboxStyle): void, (e: 'emitMapStatisticsStyle', style: MapboxStyle): void}>()

const mapGroundStyleOptions: MapOptions[] = [
  { style: MAPBOX_STYLE_SATELLITE_STREETS, name: 'Satellite', icon: new URL('./icons/satellite.svg', import.meta.url).toString() },
  { style: MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, name: 'Simple', icon: new URL('./icons/global.svg', import.meta.url).toString() }
]

const mapStatisticsDisplayStyleOptions: MapOptions[] = [
  { style: MAPBOX_STYLE_HEATMAP, name: 'Heatmap', icon: new URL('./icons/satellite.svg', import.meta.url).toString() },
  { style: MAPBOX_STYLE_BUBBLE, name: 'Bubble', icon: new URL('./icons/global.svg', import.meta.url).toString() }
]

</script>
