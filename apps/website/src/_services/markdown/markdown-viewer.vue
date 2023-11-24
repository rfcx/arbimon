<template>
  <div
    id="$attrs.id"
    ref="markdownViewerWrapperComponent"
  >
    <div id="markdown-viewer-content">
      <Markdown :source="markdown" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Markdown from 'vue3-markdown-it'

const markdownViewerWrapperComponent = ref<HTMLDivElement | null>(null)

defineProps<{ markdown: string }>()
defineExpose({ markdownViewerWrapperComponent })
</script>

<style>
#markdown-viewer-content {
  @apply pl-6 pr-6 pb-6 text-white;

  a {
    @apply text-frequency hover:underline hover:cursor-pointer;
  }

  ol {
    @apply list-decimal pl-6;
  }

  ul {
    @apply list-disc pl-6;
  }

  p, ul, ol {
    @apply mt-0 mb-4;
  }

  li > p {
    @apply mb-0;
  }
}
</style>
