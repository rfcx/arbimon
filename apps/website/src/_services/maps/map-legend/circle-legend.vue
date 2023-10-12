<template>
  <ul class="flex gap-x-4">
    <li
      v-for="legend in legendEntry"
      :key="legend.label"
      class="flex items-center"
    >
      <div
        class="rounded-full mr-2"
        :style="`background-color: ${legend.style.color}; height: ${2*legend.radiusPx}px; width: ${2*legend.radiusPx}px; border: 1px solid ${legend.style.strokeColor}`"
      >
        <span class="invisible">.</span>
      </div>
      {{ legend.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">

import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '~/maps/constants'
import type { MapBaseFormatter, MapBaseStyle } from '~/maps/types'

const props = withDefaults(defineProps<{
  mapBaseFormatter: MapBaseFormatter,
  styleNonZero?: MapBaseStyle,
  styleZero?: MapBaseStyle
}>(), {
  styleNonZero: () => DEFAULT_NON_ZERO_STYLE,
  styleZero: () => DEFAULT_ZERO_STYLE
})

const legendEntry = props.mapBaseFormatter.getLegendEntries(props.styleNonZero, props.styleZero)

</script>
