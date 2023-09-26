<template>
  <div class="rounded-xl dark:bg-moss dark:text-insight p-6 border-1 border-insight flex flex-col gap-y-4 justify-between">
    <div class="flex flex-row">
      <h5
        v-if="title"
        class="text-spoonbill text-base font-eyebrow font-medium flex-grow"
      >
        {{ title }}
        <span v-if="unit">({{ unit }})</span>
      </h5>
      <icon-fas-info-circle
        v-if="tooltipText"
        :data-tooltip-target="tooltipId"
        data-tooltip-style="light"
        class="inline-block basis-8 h-4 w-4 cursor-pointer text-spoonbill"
      />
      <div
        :id="tooltipId"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
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
        <template v-else-if="iconName === 'ft-bird-lg'">
          <icon-custom-ft-bird-lg />
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
import numeral from 'numeral'
import { computed, onMounted } from 'vue'

const props = defineProps<{
  tooltipId: string
  title?: string
  tooltipText?: string
  value: number
  totalValue?: number
  iconName: 'ft-map-pin-lg' | 'ft-bird-lg' | 'ft-search-lg' | 'ft-mic-lg'
  unit?: string
}>()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => numeral(props.value).format('0a'))
const totalShortScale = computed(() => props.totalValue === undefined ? undefined : numeral(props.totalValue).format('0a'))
</script>
