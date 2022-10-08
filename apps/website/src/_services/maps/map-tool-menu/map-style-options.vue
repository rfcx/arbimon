<template>
  <div>
    <template
      v-for="(item, idx) in props.mapOptions"
      :key="'map-statistics-style-' + item.name"
    >
      <button
        class="btn <md:(btn-icon)"
        :class="{
          'bg-brand-primary': props.mapStyle === item.style,
          'rounded-r-none': idx !== props.mapOptions.length - 1,
          'rounded-l-none': idx !== 0
        }"
        @click="$emit('emitMapStyle', item.style)"
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
  </div>
</template>
<script setup lang="ts">
import { MapboxStyle } from '~/maps'
import { MapOptions } from './types'

const props = defineProps<{
  readonly mapOptions: MapOptions[]
  readonly mapStyle: MapboxStyle
}>()

defineEmits<{(e: 'emitMapStyle', style: MapboxStyle): void}>()

</script>
