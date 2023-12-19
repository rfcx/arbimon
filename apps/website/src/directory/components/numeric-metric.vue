<template>
  <div class="dark:text-insight flex flex-col justify-center content-center h-10">
    <div class="flex flex-row items-center">
      <div class="flex items-center">
        <template v-if="iconName === 'ft-map-pin-lg'">
          <icon-custom-ft-map-pin-lg class="w-5 mr-1" />
        </template>
        <template v-else-if="iconName === 'ft-actual-bird'">
          <icon-custom-ft-actual-bird class="w-6" />
        </template>
        <template v-else-if="iconName === 'ft-search-lg'">
          <icon-custom-ft-search-lg class="w-5 mr-1" />
        </template>
        <template v-else-if="iconName === 'ft-mic-lg'">
          <icon-custom-ft-mic-lg class="w-5 mr-1" />
        </template>
      </div>
      <p
        v-if="title"
        class="text-sm ml-3 flex"
      >
        {{ title }}
      </p>
      <div class="flex-grow ml-2">
        <span class="text-sm">{{ valueShortScale }}</span>
        <span
          v-if="props.totalValue"
          class="text-sm font-medium"
        >/{{ totalShortScale }}</span>
      </div>
      <icon-custom-ic-info
        v-if="tooltipText"
        :data-tooltip-target="tooltipId"
        data-tooltip-style="light"
        class="inline-block basis-8 h-4 w-4 cursor-pointer"
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
  iconName: 'ft-map-pin-lg' | 'ft-actual-bird' | 'ft-search-lg' | 'ft-mic-lg'
}>()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => numeral(props.value).format('0a'))
const totalShortScale = computed(() => props.totalValue === undefined ? undefined : numeral(props.totalValue).format('0a'))
</script>
