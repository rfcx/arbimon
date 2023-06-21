<template>
  <div class="grid grid-cols-1 gap-2 xl:gap-4 bg-gray-300 border-2 border-gray-300 rounded-md p-6 dark:border-gray-600 h-46">
    <div class="flex justify-between rounded-t items-center h-7">
      <h3 class="text-sm xl:text-md text-gray-900">
        {{ stat.title }}
      </h3>
      <button :title="stat.title">
        <icon-fas-info-circle class="h-4 w-4 mr-2 text-gray-900 cursor-pointer" />
      </button>
    </div>
    <div class="flex items-center space-x-2 sm:space-x-3">
      <icon-fa-map-marker
        v-if="stat.value === 'site'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <icon-fa-microphone
        v-if="stat.value === 'recording'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <icon-fa-paw
        v-if="stat.value === 'species'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <icon-fa-list-ul
        v-if="stat.value === 'playlist'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <span class="text-3xl text-gray-900">{{ stat.count }}</span>
    </div>
    <div>
      <a
        class="text-l underline text-cyan-600 cursor-pointer focus:text-cyan-800 focus:bg-gray-300"
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
import { onMounted } from 'vue'

import { type Stat } from '../types'

defineProps<{stat: Stat}>()

onMounted(() => {
  initTooltips()
})

</script>
