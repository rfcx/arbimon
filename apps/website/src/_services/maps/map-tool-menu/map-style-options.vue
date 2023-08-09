<template>
  <div>
    <template
      v-for="(item, idx) in props.mapOptions"
      :key="'map-statistics-style-' + item.name"
    >
      <button
        :title="item.name"
        class="btn btn-secondary <2xl:(btn-icon)"
        :class="{
          'bg-primary': props.mapStyle === item.style,
          'rounded-r-none': idx !== props.mapOptions.length - 1,
          'rounded-l-none': idx !== 0
        }"
        @click="$emit('emitMapStyle', item.style)"
      >
        <div class="<2xl:hidden">
          {{ item.name }}
        </div>
        <div>
          <img
            class="2xl:hidden <2xl:visible"
            :src="item.icon"
            width="16"
            height="16"
          >
        </div>
      </button>
    </template>
  </div>
</template>
<script setup lang="ts">
import type { MapboxStyle } from '~/maps'
import type { MapOptions } from './types'

const props = defineProps<{
  readonly mapOptions: MapOptions[]
  readonly mapStyle: MapboxStyle
}>()

defineEmits<{(e: 'emitMapStyle', style: MapboxStyle): void}>()

</script>
