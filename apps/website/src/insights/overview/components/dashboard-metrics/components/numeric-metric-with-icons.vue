<template>
  <div class="rounded-xl dark:bg-moss dark:text-insight p-6 border-1 border-insight flex flex-col gap-y-4 justify-between shadow-lg shadow-frequency/10">
    <div class="flex flex-row items-baseline ">
      <h5
        v-if="title"
        class="text-spoonbill text-base font-eyebrow font-medium flex-grow"
      >
        {{ title }}
        <span v-if="unit">({{ unit }})</span>
      </h5>
      <icon-custom-ic-info
        v-if="tooltipText"
        :data-tooltip-target="tooltipId"
        data-tooltip-style="light"
        class="basis-8 h-5 w-5 cursor-pointer text-spoonbill pt-1.25"
      />
      <div
        :id="tooltipId"
        role="tooltip"
        class="absolute w-50 z-50 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ tooltipText }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>

    <div class="flex flex-row gap-x-3">
      <div class="flex items-center">
        <template v-if="iconName === 'ft-map-pin-lg'">
          <icon-custom-ft-map-pin-lg />
        </template>
        <template v-else-if="iconName === 'ft-actual-bird'">
          <icon-custom-ft-actual-bird />
        </template>
        <template v-else-if="iconName === 'ft-search-lg'">
          <icon-custom-ft-search-lg />
        </template>
        <template v-else-if="iconName === 'ft-mic-lg'">
          <icon-custom-ft-mic-lg />
        </template>
      </div>
      <div>
        <span class="font-medium sm:text-3xl text-2xl font-header">{{ valueShortScale }}</span>
        <span
          v-if="totalShortScale"
          class="ml-2 sm:text-3xl text-lg font-header font-medium"
        >/ {{ totalShortScale }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { computed, onMounted } from 'vue'

import { metricValue } from '@rfcx-bio/utils/number'

const props = defineProps<{
  tooltipId: string
  title?: string
  tooltipText?: string
  value: number
  totalValue?: number
  iconName: 'ft-map-pin-lg' | 'ft-actual-bird' | 'ft-search-lg' | 'ft-mic-lg'
  unit?: string
}>()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => metricValue(props.value))
const totalShortScale = computed(() => props.totalValue === undefined ? undefined : metricValue(props.totalValue))
</script>
