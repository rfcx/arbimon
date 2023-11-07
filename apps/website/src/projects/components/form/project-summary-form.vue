<template>
  <div class="mt-4 flex flex-row justify-between items-center">
    <label
      for="summary"
      class="block mb-2 font-medium text-gray-900 dark:text-insight"
    >Project blurb</label>
    <icon-custom-ic-info
      data-tooltip-target="summary_tooltip"
      data-tooltip-style="light"
      class="inline-block basis-8 h-4 w-4 cursor-pointer text-insight"
    />
    <div
      id="summary_tooltip"
      role="tooltip"
      class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
    >
      {{ PLACEHOLDER_TEXT }}
      <div
        class="tooltip-arrow"
        data-popper-arrow
      />
    </div>
  </div>
  <textarea
    v-model.lazy.trim="summary"
    class="input-field w-full h-28"
  />
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  existingSummary?: string
}>()

const emit = defineEmits<{(e: 'emitProjectSummary', summary: string): void}>()

const PLACEHOLDER_TEXT = 'One line summary about the project. Some context such as timeline, goals. Some context such as timeline, goals.'

const summary = ref('')

onMounted(() => {
  initTooltips()
  if (props.existingSummary) {
    summary.value = props.existingSummary
  }
})

watch(() => props.existingSummary, () => {
  summary.value = props.existingSummary || ''
})

watch(summary, () => {
  emit('emitProjectSummary', summary.value)
})

</script>
