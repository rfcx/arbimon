<template>
  <span
    v-if="simpleNoDataText && !hasData"
    class="text-sm"
  >
    {{ simpleNoDataText }}
  </span>
  <no-data-panel
    v-else-if="!hasData"
    class="h-20"
  />
  <div v-else>
    <div class="relative">
      <div
        class="absolute w-full h-6 rounded-4xl bg-steel-grey-light"
        :class="smallVersion ? `h-5` : `h-6`"
      />
      <div
        v-for="(bar, idx) in bars"
        :key="'dashboard-richness-percentage-' + bar.name"
        class="absolute h-6 border-4 border-echo"
        :class="{
          'h-5': smallVersion,
          'h-6': !smallVersion,
          'rounded-l-4xl rounded-r-4xl': idx === bars.length - 1,
          'rounded-l-4xl': idx !== bars.length - 1
        }"
        :style="{ width: bar.width + '%', backgroundColor: bar.color, zIndex: bars.length - idx }"
      >
        <div
          class="opacity-50 h-4 w-full"
          :class="bar.id !== selectedId ? 'bg-pitch' : ''"
          :style="{ zIndex: bars.length - idx}"
        />
      </div>
    </div>
    <div
      v-if="!viewOnly"
      class="pt-9 flex flex-row flex-wrap gap-4"
    >
      <button
        v-for="bar in bars"
        :key="bar.id"
        class="rounded-full border-1 text-insight px-4 py-2"
        :style="{
          borderColor: bar.color,
          backgroundColor: bar.id === selectedId ? bar.color : ''
        }"
        @click="$emit('emitSelectItem', bar.id)"
      >
        <span class="font-display text-sm">{{ bar.name }} ({{ bar.count }}, {{ bar.percentage.toFixed(1) }}%)</span>
      </button>
    </div>
    <div
      v-else
      class="pt-9 flex flex-row flex-wrap gap-4"
    >
      <div
        v-for="bar in bars"
        :key="bar.id"
        class="inline-flex items-baseline"
      >
        <div
          class="rounded-full w-1.5 h-1.5 self-center mx-2"
          :style="{ backgroundColor: bar.color }"
        />
        {{ bar.name }} ({{ bar.count }}, {{ bar.percentage.toFixed(1) }}%)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sum } from 'lodash-es'
import { computed } from 'vue'

export interface HorizontalStack {
  id: number
  name: string
  count: number
  color: string
}

export interface Bar {
  id: number
  name: string
  percentage: number
  count: number
  width: number
  color: string
}

const props = withDefaults(defineProps<{
  dataset: HorizontalStack[],
  knownTotalCount?: string,
  selectedId?: number
  viewOnly?: boolean
  simpleNoDataText?: string // only use in project directory
  smallVersion: boolean
}>(), {
  knownTotalCount: undefined,
  simpleNoDataText: undefined,
  selectedId: -1,
  viewOnly: true,
  smallVersion: false
})

defineEmits(['emitSelectItem'])

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

  inputs.forEach(({ id, name, count, color }) => {
    const percentage = count / totalCount.value * 100
    width += percentage

    outputs.push({
      id,
      name,
      percentage,
      count,
      width: Math.round(width),
      color
    })
  })

  return outputs
})
</script>
