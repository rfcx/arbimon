<template>
  <div>
    <span class="text-xs text-spoonbill font-eyebrow">{{ publication.year }}</span>
    <p>{{ publication.title }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Publication } from '../data/types'

defineProps<{
  readonly publication: Publication
}>()
</script>
