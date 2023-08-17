<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-8 px-4 mx-auto max-w-screen-lg xl:gap-16 sm:py-16 lg:px-6">
      <p class="mb-8 text-lg font-medium">
        {{ props.content?.subtitle }}
      </p>
      <Markdown
        id="featured-content-markdown-container"
        class="text-justify columns-1 lg:columns-2 lg:gap-x-8"
        :source="props.content?.paragraphs.join('\n\n') ?? ''"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import Markdown from 'vue3-markdown-it'

import { type ProjectOverviewContent } from '../../featured/data/types'

const props = defineProps<{
  readonly content: ProjectOverviewContent | null
}>()
</script>

<style lang="scss">
div#featured-content-markdown-container {
  p:not(:last-child) {
    margin-bottom: 0.75rem;
  }
}
</style>
