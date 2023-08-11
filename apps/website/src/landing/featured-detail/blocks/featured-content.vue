<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-8 px-4 mx-auto max-w-screen-lg xl:gap-16 sm:py-16 lg:px-6">
      <p class="mb-8 text-lg font-medium">
        {{ props.content?.subtitle }}
      </p>
      <div class="flex flex-col gap-8 lg:flex-row">
        <Markdown
          id="featured-content-left-markdown-container"
          class="basis-1/2 text-justify"
          :source="props.content?.paragraphs[0] ?? ''"
        />
        <Markdown
          id="featured-content-right-markdown-container"
          class="basis-1/2 text-justify"
          :source="props.content?.paragraphs[1] ?? ''"
        />
      </div>
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
div#featured-content-left-markdown-container, div#featured-content-right-markdown-container {
  p:not(:last-child) {
    margin-bottom: 0.75rem;
  }
}
</style>
