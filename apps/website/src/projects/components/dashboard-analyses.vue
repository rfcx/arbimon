<template>
  <div class="grid grid-cols-1 gap-2 bg-stone-900 border-1 border-orange-100 rounded-2xl shadow p-6 dark:border-orange-100 h-46">
    <div class="h-8">
      <a
        class="text-xl font-medium text-frequency font-header cursor-pointer border-b-1 border-frequency"
        :href="analysis.link"
        :title="analysis.title"
        target="_blank"
      >
        {{ analysis.title }}
      </a>
    </div>
    <div class="flex items-center font-body text-xl space-x-2 sm:space-x-3 text-gray-300">
      <span>{{ analysis.label }}:</span>
      <icon-fas-spinner
        v-if="analysis.isLoading"
        class="animate-spin h-8 w-8 text-gray-900"
      />
      <span v-if="analysis.count !== undefined">{{ analysis.count }}</span>
    </div>
    <div
      class="flex items-center font-body text-xl space-x-2 sm:space-x-3 text-gray-300"
    >
      <span>{{ analysis.speciesTitle }} {{ analysis.speciesTitle ? ':' : '-' }}</span>
      <span>{{ analysis.speciesDetected }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Analysis } from '../types'

defineProps<{analysis: Analysis}>()

</script>
