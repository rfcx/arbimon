<template>
  <div
    class="flex flex-col bg-moss border-1 border-transparent rounded-lg shadow p-4 h-58 hover:bg-util-gray-02"
    @click="selectedAnalysis()"
  >
    <p
      class="text-2xl text-left font-medium text-insight cursor-pointer"
      :title="analysis.title"
    >
      {{ analysis.title }}
    </p>
    <div class="text-left text-base pt-2 text-insight h-32 overflow-y-auto">
      {{ analysis.description }}
    </div>
    <div
      class="pt-2 text-left"
    >
      <a
        class="text-base text-frequency cursor-pointer border-b-1 border-frequency"
        :href="analysis.link"
        :title="analysis.label"
        target="_blank"
      >
        {{ analysis.label }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type AnalysisCard } from '../types'

const props = defineProps<{analysis: AnalysisCard}>()
const emit = defineEmits<{(event: 'emitSelectedAnalysis', value: string): void}>()

function selectedAnalysis (): void {
  console.info('emitSelectedAnalysis', props.analysis.url)
  emit('emitSelectedAnalysis', props.analysis.url)
}
</script>
