<template>
  <div class="grid grid-cols-1 gap-2 bg-stone-900 border-1 border-orange-100 rounded-2xl shadow py-4 px-6 dark:border-orange-100 h-36">
    <div class="flex justify-start rounded-t items-center h-6">
      <h3 class="text-base text-rose-300 text-eyebrow font-normal">
        {{ stat.title }}
      </h3>
      <button :title="stat.title">
        <icon-fas-info-circle class="h-3 w-3 ml-2 text-rose-300 cursor-pointer" />
      </button>
    </div>
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
      <icon-custom-ft-bird-lg
        v-if="stat.value === 'species'"
      />
      <icon-fas-spinner
        v-if="stat.isLoading && stat.count === undefined"
        class="animate-spin h-8 w-8 text-white"
      />
      <span
        v-if="stat.count !== undefined"
        class="text-3xl text-white font-header font-medium"
      >{{ valueShortScale }}</span>
    </div>
    <div>
      <a
        class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-gray-300 border-b-1 border-frequency"
        :href="stat.link"
      >
        {{ stat.label }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { initTooltips } from 'flowbite'
import numeral from 'numeral'
import { computed, onMounted } from 'vue'

import { type Stat } from '../types'

const props = defineProps<{stat: Stat}>()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => {
  const formattedNumber = numeral(props.stat.count).format('0.0a')
  const firstDecimalDigit = (x: string) => x.split('.')[1].slice(0, 1)
  return firstDecimalDigit(formattedNumber) === '0' ? formattedNumber.replace('.0', '') : formattedNumber
})

</script>
