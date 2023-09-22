<template>
  <div class="flex flex-col bg-moss border-1 border-transparent rounded-lg shadow p-4 h-58">
    <p
      class="text-2xl text-left font-medium text-insight cursor-pointer"
      :title="analysis.title"
    >
      {{ analysis.title }}
    </p>
    <div class="text-left text-base pt-2 text-insight">
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

defineProps<{analysis: AnalysisCard}>()
</script>
