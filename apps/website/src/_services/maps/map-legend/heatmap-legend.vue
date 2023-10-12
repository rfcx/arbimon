<template>
  <div class="flex gap-y-2 flex-col justify-center min-w-50">
    <div
      v-if="mapLegendLabels"
      class="flex"
      :class="`justify-${mapLegendLabels.length === 1 ? 'center' : 'between'}`"
    >
      <span
        v-for="n in mapLegendLabels"
        :key="n"
      >
        {{ n }}
        <span v-if="n === mapLegendLabels[mapLegendLabels.length - 1]">+</span>
      </span>
    </div>
    <span
      v-else
      class="text-fog text-center text-sm"
    >
      No data
    </span>
    <div class="bg-gradient-to-r from-[#4A7BB7] from-20% via-[#98CAE1] via-40% via-[#EAECCC] via-60% via-[#FDB366] via-80% to-[#DD3D2D] to-100% h-2 rounded-full">
      <span class="invisible">Legend</span>
    </div>
    <div class="text-center">
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

const MINIMUM_VALUE = 10

const props = defineProps<{
  maxValue: number,
  title: string,
}>()

const mapLegendLabels = computed(() => {
  const maxValue = Math.max(props.maxValue, MINIMUM_VALUE)
  if (maxValue === 0) return null
  return [1, Math.ceil(maxValue / 2), maxValue]
})

</script>
