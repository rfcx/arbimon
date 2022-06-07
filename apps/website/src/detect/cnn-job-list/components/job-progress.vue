<template>
  <div class="mb-1 text-xs text-subtle">
    {{ props.jobProgress.status }}
  </div>
  <div class="w-14 bg-faded rounded-full h-2.5">
    <div
      class="bg-brand-primary h-2.5 rounded-full"
      :style="{ 'width': `${props.jobProgress.value}%` }"
    >
      <!---->
    </div>
  </div>
</template>

<script setup lang="ts">
import { JobProgress } from '~/job'

const props = defineProps<{
  jobProgress: JobProgress
}>()
</script>
