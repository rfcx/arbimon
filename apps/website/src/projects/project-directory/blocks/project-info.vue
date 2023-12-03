<template>
  <div class="inset-1/4 left-100 w-98 bg-moss transition-transform -translate-x-full p-6 lg:p-10">
    {{ project.name }}
  </div>
</template>
<script setup lang="ts">
import { type ProjectProfileWithMetrics } from '../data/types'

defineProps<{ project: ProjectProfileWithMetrics }>()
</script>
