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
      <icon-fa-map-marker
        v-if="stat.value === 'site'"
        class="h-6 w-6 text-white"
      />
      <icon-fa-microphone
        v-if="stat.value === 'recording'"
        class="h-6 w-6 text-white"
      />
      <icon-fa-paw
        v-if="stat.value === 'species'"
        class="h-6 w-6 text-white"
      />
      <icon-fa-list-ul
        v-if="stat.value === 'playlist'"
        class="h-6 w-6 text-white"
      />
      <icon-fas-spinner
        v-if="stat.isLoading"
        class="animate-spin h-8 w-8 text-white"
      />
      <span
        v-if="stat.count !== undefined"
        class="text-3xl text-white text-display font-medium"
      >{{ valueShortScale }}</span>
    </div>
    <div>
      <a
        class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-gray-300 border-b-1 border-frequency"
        :href="stat.link"
        target="_blank"
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
