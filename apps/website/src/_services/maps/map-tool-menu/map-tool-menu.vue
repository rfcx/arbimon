<template>
  <div class="flex">
    <map-style-options
      :map-ground-style="props.mapGroundStyle"
      :map-statistics-style="props.mapStatisticsStyle"
      @emit-map-ground-style="emitMapGroundStyle"
      @emit-map-statistics-style="emitMapStatisticsStyle"
    />
    <button
      class="btn ml-2"
      :class="{ '<lg:(bg-brand-primary btn-icon)': isShowLabel }"
      @click="emitShowLabelsToggle"
    >
      <div class="flex items-center <lg:hidden">
        <input
          type="checkbox"
          class="mr-2 text-brand-primary focus:(ring-0 outline-none) rounded"
          :checked="isShowLabel"
        >
        Labels
      </div>
      <div class="lg:hidden">
        <icon-fas-tag class="text-xs" />
      </div>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import { MapboxStyle } from '~/maps'
import MapStyleOptions from './map-style-options.vue'

const isShowLabel = ref<boolean>(true)

const props = defineProps<{
  readonly mapGroundStyle: MapboxStyle
  readonly mapStatisticsStyle: MapboxStyle
}>()

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

</script>
