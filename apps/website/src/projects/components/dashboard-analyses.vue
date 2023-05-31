<template>
  <div class="grid grid-cols-1 gap-2 xl:gap-4 border-2 rounded-lg border-gray-300 dark:border-gray-600 p-6 h-46">
    <div class="flex justify-between rounded-t items-center">
      <a
        class="text-xl underline text-cyan-600 cursor-pointer"
      >
        {{ analysis.title }}
      </a>
      <icon-fas-info-circle class="h-4 w-4 mr-2 text-gray-300 cursor-pointer" />
    </div>
    <div class="flex items-center space-x-2 sm:space-x-3 text-xl text-gray-300">
      <span>{{ analysis.label }}:</span>
      <span>{{ analysis.count }}</span>
    </div>
    <div class="flex items-center space-x-2 sm:space-x-3 text-xl text-gray-300">
      <span>Templates:</span>
      <span>{{ analysis.countTemplate }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Analysis } from '../types'

defineProps<{analysis: Analysis}>()

</script>
