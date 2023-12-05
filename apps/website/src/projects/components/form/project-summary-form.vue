<template>
  <div class="mt-6 flex flex-row">
    <label
      for="summary"
      class="block mb-2 font-medium text-gray-900 dark:text-insight"
    >Project blurb</label>
    <icon-i-info
      tooltip-id="summary_tooltip"
      :tooltip-text="PLACEHOLDER_TEXT"
    />
  </div>
  <textarea
    v-model.trim="summary"
    :disabled="isDisabled"
    class="input-field w-full h-28 disabled:opacity-75 disabled:cursor-not-allowed"
    :placeholder="PLACEHOLDER_SUMMARY_TEXT"
    :maxlength="MAX"
  />
  <span class="flex flex-row-reverse items-end text-fog text-xs">{{ summary.length }}/{{ MAX }} Characters</span>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted, ref, watch } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const props = defineProps<{
  existingSummary?: string
  isDisabled?: boolean
}>()

const emit = defineEmits<{(e: 'emitProjectSummary', summary: string): void}>()

const PLACEHOLDER_TEXT = 'Write a brief, catchy description of your project.'
const PLACEHOLDER_SUMMARY_TEXT = 'e.g. This project aims to set up the bioacoustic archive for the State of Santa Catarina, at Brazil.'
const MAX = 140

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
