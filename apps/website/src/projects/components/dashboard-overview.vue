<template>
  <div class="flex flex-col gap-2 bg-stone-900 border-1 border-insight rounded-2xl shadow py-4 px-6 shadow-lg shadow-frequency/10">
    <div class="flex flex-row h-13">
      <h5
        v-if="stat.title"
        class="text-spoonbill text-base font-eyebrow font-medium flex-grow"
      >
        {{ stat.title }}
      </h5>
      <icon-custom-ic-info
        v-if="stat.description"
        :data-tooltip-target="stat.value"
        data-tooltip-style="light"
        class="inline-block basis-8 h-4 w-4 mt-1.25 cursor-pointer text-spoonbill"
      />
      <div
        :id="stat.value"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ stat.description }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>
    <div
      v-if="stat.count === undefined && !stat.isLoading"
      class="flex flex-col"
    >
      <span class="text-white text-xs items-center pb-3 px-2">
        It seems the metric didn’t load as expected.
        Please refresh your browser to give it another go.
      </span>
    </div>
    <div v-else>
      <div class="flex items-center space-x-2 sm:space-x-3">
        <icon-custom-ft-map-pin-lg
          v-if="stat.value === 'site'"
        />
        <icon-custom-ft-mic-lg
          v-if="stat.value === 'recording'"
        />
        <icon-custom-fi-list
          v-if="stat.value === 'playlist'"
        />
        <icon-custom-ft-actual-bird
          v-if="stat.value === 'species'"
        />
        <icon-custom-ic-loading
          v-if="stat.isLoading && stat.count === undefined"
          class="animate-spin h-8 w-8 text-white"
        />
        <span
          v-if="stat.count !== undefined"
          class="text-3xl text-white font-header font-medium"
        >{{ valueShortScale }}</span>
      </div>
      <div v-if="stat.value === 'site' && store.userIsFullProjectMember">
        <a
          class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
          :href="stat.link"
        >
          {{ stat.label }}
        </a>
      </div>
      <div v-if="stat.value === 'recording' && store.userIsDataEntryMember">
        <a
          class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
          :href="stat.link"
        >
          {{ stat.label }}
        </a>
      </div>
      <div v-if="stat.value === 'playlist' && store.userIsFullProjectMember">
        <a
          class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
          :href="stat.link"
        >
          {{ stat.label }}
        </a>
      </div>
      <div v-if="stat.value === 'species' && store.userIsDataEntryMember">
        <a
          class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
          :href="stat.link"
        >
          {{ stat.label }}
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { computed, onMounted } from 'vue'

import { metricValue } from '@rfcx-bio/utils/number'

import { useStore } from '~/store'
import { type Stat } from '../types'

const props = defineProps<{stat: Stat}>()

const store = useStore()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => {
  return props.stat.count === undefined ? '-' : metricValue(props.stat.count)
})
</script>
