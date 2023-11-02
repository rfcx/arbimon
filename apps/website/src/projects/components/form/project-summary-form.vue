<template>
  <div class="mt-4">
    <label
      for="summary"
      class="block mb-2 font-medium text-gray-900 dark:text-insight"
    >Project summary</label>
  </div>
  <textarea
    v-model.lazy.trim="summary"
    :placeholder="PLACEHOLDER_TEXT"
    class="input-field w-full"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  existingSummary?: string
}>()

const emits = defineEmits<{(e: 'emitProjectSummary', summary: string): void}>()

const PLACEHOLDER_TEXT = 'One line summary about the project. Some context such as timeline, goals. Some context such as timeline, goals.'

const summary = ref('')

onMounted(() => {
  if (props.existingSummary) {
    summary.value = props.existingSummary
  }
})

watch(summary, () => {
  emits('emitProjectSummary', summary.value)
})

</script>
