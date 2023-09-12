<template>
  <div class="rounded-xl dark:bg-moss dark:text-insight p-6 border-1 border-insight flex flex-col justify-between">
    <h5
      v-if="title"
      class="text-spoonbill font-eyebrow"
    >
      {{ title }}<span
        v-if="unit"
        class="ml-2"
      >({{ unit }})</span>
      <icon-fas-info-circle
        v-if="tooltipText"
        :data-tooltip-target="$refs.tooltip"
        class="inline-block h-4 w-4 ml-1 cursor-pointer"
      />
      <div
        ref="tooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        {{ tooltipText }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </h5>
    <div class="mt-4">
      <span class="font-medium text-4xl <sm:text-2xl font-header">{{ valueShortScale }}</span>
      <span
        v-if="totalShortScale"
        class="ml-2 text-2xl <sm:text-lg"
      >/ {{ totalShortScale }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import numeral from 'numeral'
import { computed, onMounted } from 'vue'

const props = defineProps<{
  value: number
  totalValue?: number
  title?: string
  unit?: string
  tooltipText?: string
}>()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => numeral(props.value).format('0a'))
const totalShortScale = computed(() => props.totalValue === undefined ? undefined : numeral(props.totalValue).format('0a'))
</script>
