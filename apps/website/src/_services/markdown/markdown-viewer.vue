<template>
  <div
    ref="toastUiViewer"
  />
</template>

<script setup lang="ts">
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import { type Ref, onMounted, ref } from 'vue'

const toastUiViewer = ref() as Ref<HTMLDivElement>
const props = defineProps<{ value: string }>()
const viewer = ref<Viewer | null>(null)

onMounted(() => {
  viewer.value = new Viewer({
    el: toastUiViewer.value,
    initialValue: props.value
  })
})
</script>

<style lang="scss">
div.toastui-editor-contents {
  h2 {
    @apply text-xl;
  }

  h2:not(:first-child) {
    @apply mt-5;
  }

  p:not(:last-child) {
    @apply mb-3;
  }

  ul {
    @apply list-disc ml-5;
  }

  ol {
    @apply list-decimal ml-5;
  }

  a {
    @apply text-frequency hover:underline;
  }

  // INFO: Checkout https://stackoverflow.com/a/4094151/12386405 for how I did it
  table {
    border-collapse: separate;
    border-spacing: 0;
  }

  table td, table th {
    @apply px-4 py-1;
  }

  table th {
    @apply border-1 border-solid border-frequency;
  }

  table th:first-child {
    border-right: none;
  }

  table th:last-child {
    border-left: none;
  }

  table th:not(:first-child):not(:last-child) {
    border-left: none;
    border-right: none;
  }

  table tr:first-child th:first-child {
    @apply rounded-tl-2xl;
  }

  table tr:first-child th:last-child {
    @apply rounded-tr-2xl;
  }

  table tr td:first-child {
    @apply border-l-1 border-l-solid border-l-frequency;
  }

  table tr td:last-child {
    @apply border-r-1 border-r-solid border-r-frequency;
  }

  table tr:last-child td {
    @apply border-b-1 border-b-solid border-b-frequency;
  }

  table tr:last-child td:first-child {
    @apply rounded-bl-2xl;
  }

  table tr:last-child td:last-child {
    @apply rounded-br-2xl;
  }
}
</style>
