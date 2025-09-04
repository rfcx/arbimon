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

const props = defineProps<{
  maxValue: number,
  minValue?: number,
  title: string,
}>()

const isFloat = (num: number) => {
  return !isNaN(num) && num % 1 !== 0
}

const mapLegendLabels = computed(() => {
  const maxValue = props.maxValue
  if (maxValue === 0) return null
  if (props.minValue !== undefined) return [props.minValue, isFloat(maxValue) ? (maxValue / 2).toFixed(2) : Math.ceil(maxValue / 2), isFloat(maxValue) ? maxValue.toFixed(3) : maxValue]
  return [0, isFloat(maxValue) ? (maxValue / 2).toFixed(3) : Math.ceil(maxValue / 2), isFloat(maxValue) ? maxValue.toFixed(3) : maxValue]
})

</script>
