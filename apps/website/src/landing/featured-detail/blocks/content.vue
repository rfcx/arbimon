<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-8 px-4 mx-auto max-w-screen-lg xl:gap-16 sm:py-16 lg:px-6">
      <p class="mb-8 text-lg text-bold">
        {{ props.content?.subtitle }}
      </p>
      <div class="flex flex-row gap-8">
        <p>{{ props.content?.paragraphs[0] ?? '' }}</p>
        <p>{{ props.content?.paragraphs[1] ?? '' }}</p>
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
