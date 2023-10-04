<template>
  <Markdown :source="markdown" />
</template>

<script setup lang="ts">
import Markdown from 'vue3-markdown-it'

defineProps<{ markdown: string }>()
</script>
