<template>
  <div class="rounded-xl dark:bg-moss dark:text-insight p-6 border-1 border-insight flex flex-col gap-y-4 justify-between">
    <div class="flex flex-row items-baseline">
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
        class="inline-block h-4 w-4 ml-1 cursor-pointer text-spoonbill"
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

    <div>
      <span class="font-medium text-3xl <sm:text-2xl font-header">{{ valueShortScale }}</span>
      <span
        v-if="totalShortScale"
        class="ml-2 text-3xl <sm:text-lg"
      >/ {{ totalShortScale }}</span>
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
  unit?: string
}>()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => numeral(props.value).format('0a'))
const totalShortScale = computed(() => props.totalValue === undefined ? undefined : numeral(props.totalValue).format('0a'))
</script>
