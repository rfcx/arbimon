<template>
  <div class="mb-10 px-10 pt-6 pb-8 border-1 rounded-2xl border-frequency bg-moss">
    <span class="text-xs text-spoonbill font-eyebrow">
      {{ props.publication.year }} | {{ publication.journal }}
    </span>
    <p class="text-xl mt-2 leading-7 text-white/80">
      {{ publication.title }}
    </p>
    <p class="text-base text-white/80 mt-2">
      {{ publication.author }}
    </p>
    <a
      :href="publication.doiUrl"
      rel="noreferrer nofollow"
      class="inline-block mt-4 text-frequency"
    >
      Read the paper <icon-fas-arrow-right class="inline-block text-frequency" />
    </a>
  </div>
</template>

<script setup lang="ts">
import type { Publication } from '../data/types'

const props = defineProps<{ publication: Publication }>()
</script>
