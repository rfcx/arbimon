<template>
  <div
    class="flex flex-col gap-y-2.5 justify-between bg-moss border-1 rounded-lg shadow p-4 hover:bg-util-gray-03 cursor-pointer"
    :class="isSelected ? 'border-frequency' : 'border-transparent'"
    @click="selectedAnalysis()"
  >
    <h5
      :title="analysis.title"
    >
      {{ analysis.title }}
    </h5>
    <div
      class="text-left text-base text-insight overflow-y-auto"
      :class="{'h-18': !isReadMore}"
    >
      <span :class="{'line-clamp-2': !isReadMore}">{{ analysis.description }}</span>
      <button
        :id="`${analysis.title}-read-more`"
        class="bg-transparent"
        :class="isReadMore === true ? 'block' : 'inline'"
        @click="expandDescription"
      >
        <span class="text-frequency">
          {{ isReadMore ? 'Read less' : 'read more' }}
        </span>
      </button>
    </div>
    <div
      v-if="isReadMore"
      class="text-left"
    >
      <a
        class="text-base cursor-pointer text-util-gray-01 hover:underline"
        :href="analysis.link"
        :title="analysis.label"
      >
        <icon-custom-fi-external-link class="w-4 h-4 inline-flex" />
        {{ analysis.label }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'

import { type AnalysisCard } from '../types'

const props = defineProps<{analysis: AnalysisCard}>()
const emit = defineEmits<{(event: 'emitSelectedAnalysis', url: string, value: string): void}>()
const isSelected = ref(false)
const isReadMore = ref(false)

watch(() => props.analysis.isSelected, (newValue) => {
  isSelected.value = newValue
}, { deep: true })

function selectedAnalysis (): void {
  isSelected.value = !isSelected.value
  emit('emitSelectedAnalysis', isSelected.value ? props.analysis.url : '', isSelected.value ? props.analysis.value : '')
}

function expandDescription (): void {
  isReadMore.value = !isReadMore.value
}
</script>
