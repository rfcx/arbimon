<template>
  <div class="grid grid-cols-1 gap-2 xl:gap-4 border-2 rounded-lg border-gray-300 dark:border-gray-600 p-6 h-46">
    <div class="flex justify-between rounded-t items-center">
      <a
        class="text-xl underline text-cyan-600 cursor-pointer"
        :href="analysis.link"
        target="_blank"
      >
        {{ analysis.title }}
      </a>
      <button :title="analysis.title">
        <icon-fas-info-circle class="h-4 w-4 mr-2 text-gray-300 cursor-pointer" />
      </button>
    </div>
    <div class="flex items-center space-x-2 sm:space-x-3 text-xl text-gray-300">
      <span>{{ analysis.label }}:</span>
      <icon-fas-spinner
        v-if="analysis.isLoading"
        class="animate-spin h-8 w-8 text-gray-900"
      />
      <span v-if="analysis.count">{{ analysis.count }}</span>
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
