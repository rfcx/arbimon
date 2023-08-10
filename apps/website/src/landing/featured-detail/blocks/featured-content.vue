<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-8 px-4 mx-auto max-w-screen-lg xl:gap-16 sm:py-16 lg:px-6">
      <p class="mb-8 text-lg font-medium">
        {{ props.content?.subtitle }}
      </p>
      <div class="flex flex-col gap-8 lg:flex-row">
        <p class="basis-1/2 text-justify">
          {{ props.content?.paragraphs[0] ?? '' }}
        </p>
        <p class="basis-1/2 text-justify">
          {{ props.content?.paragraphs[1] ?? '' }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { type ProjectOverviewContent } from '../../featured/data/types'

const props = defineProps<{
  readonly content: ProjectOverviewContent | null
}>()

</script>
