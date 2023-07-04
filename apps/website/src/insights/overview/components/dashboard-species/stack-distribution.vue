<template>
  <no-data-panel
    v-if="!hasData"
    class="h-20"
  />
  <div v-else>
    <div class="relative mx-2">
      <div class="absolute w-full h-1 rounded-xl bg-steel-grey-light" />
      <div
        v-for="(bar, idx) in bars"
        :key="'dashboard-richness-percentage-' + bar.name"
        class="absolute h-1 rounded-4xl"
        :style="{ width: bar.width + '%', backgroundColor: bar.color , zIndex: bars.length - idx }"
      />
    </div>
    <div class="pt-3">
      <ul class="list-none">
        <li
          v-for="bar in bars"
          :key="'dashboard-richness-class-' + bar.name"
          class="inline-flex items-baseline text-xs"
        >
          <div
            class="rounded-full w-1.5 h-1.5 self-center mx-2"
            :style="{ backgroundColor: bar.color }"
          />
          {{ bar.name }}
          <span class="ml-1 text-subtle font-light">{{ bar.percentage.toFixed(1) }}%</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sum } from 'lodash-es'
import { computed } from 'vue'

import { type Bar, type HorizontalStack } from './types'

const props = withDefaults(defineProps<{
  dataset: HorizontalStack[],
  knownTotalCount?: string
}>(), {
  knownTotalCount: undefined
})

const totalCount = computed<number>(() => {
  return Number(props.knownTotalCount) ?? sum(props.dataset.map(({ count }) => count))
})

const hasData = computed<boolean>(() => {
  return totalCount.value > 0
})

const bars = computed<Bar[]>(() => {
  // Avoid divide by zero
  if (totalCount.value === 0) {
    return []
  }

  // Remove empty bars
  const inputs = props.dataset.filter(({ count }) => count > 0)

  // Claculate percentages & bar-widths (width is cumulative percentage)
  let width = 0
  const outputs: Bar[] = []

  inputs.forEach(({ name, count, color }) => {
    const percentage = count / totalCount.value * 100
    width += percentage

    outputs.push({
      name,
      percentage,
      width: Math.round(width),
      color
    })
  })

  return outputs
})
</script>
