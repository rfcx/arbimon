<template>
  <section class="bg-white dark:bg-moss">
    <div class="pb-30 px-4 mx-auto max-w-screen-sm lg:px-6">
      <div
        v-if="image"
        class="mb-6"
      >
        <img
          class="rounded-xl mx-auto w-full h-full"
          :src="props.image"
        >
      </div>
      <h3 class="mb-6 font-medium">
        {{ props.title }}
      </h3>
      <div class="flex flex-col items-center gap-10">
        <Markdown
          id="impact-markdown"
          :source="props.textParagraphs.join('')"
        />
        <a
          v-if="props.ctaLink"
          :href="props.ctaLink"
          class="items-center justify-center w-64 btn btn-primary"
        >
          {{ props.ctaText }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Markdown from 'vue3-markdown-it'

const props = defineProps<{
  readonly title: string
  readonly textParagraphs: string[]
  readonly ctaText: string
  readonly ctaLink: string
  readonly image: string
}>()
</script>

<style lang="scss">
div#impact-markdown {
  ol {
    list-style-type: decimal;
    padding-left: 0.75rem;
  }

  p:not(:last-child) {
    margin-bottom: 0.75rem;
  }
}
</style>
