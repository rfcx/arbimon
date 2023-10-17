<template>
  <div
    class="flex flex-col justify-between bg-moss border-1 rounded-lg shadow p-4 hover:bg-util-gray-02 cursor-pointer"
    :class="isSelected ? 'border-frequency' : 'border-transparent'"
    @click="selectedAnalysis()"
  >
    <div class="flex flex-col gap-y-2">
      <p
        class="text-2xl text-left font-medium text-insight cursor-pointer"
        :title="analysis.title"
      >
        {{ analysis.title }}
      </p>
      <div class="text-left text-base text-insight pb-2">
        {{ analysis.description }}
      </div>
    </div>
    <div
      class="text-left"
    >
      <a
        class="text-base text-frequency cursor-pointer border-b-1 border-frequency"
        :href="analysis.link"
        :title="analysis.label"
      >
        {{ analysis.label }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import { type AnalysisCard } from '../types'

const props = defineProps<{analysis: AnalysisCard}>()
const emit = defineEmits<{(event: 'emitSelectedAnalysis', value: string): void}>()
const isSelected = ref(false)

function selectedAnalysis (): void {
  isSelected.value = !isSelected.value
  console.info('emitSelectedAnalysis', isSelected.value, props.analysis.url)
  emit('emitSelectedAnalysis', props.analysis.url)
}
</script>
