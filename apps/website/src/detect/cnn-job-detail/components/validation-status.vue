<template>
  <div class="ml-0 text-sm">
    <icon-fa-check
      v-if="props.value === 'confirmed'"
      class="cursor-pointer h-3 text-sky-300 inline mr-2"
    />
    <icon-fa-close
      v-if="props.value === 'rejected'"
      class="cursor-pointer h-3 text-orange-300 inline mr-2"
    />
    <icon-fa-circle
      v-if="props.value === 'uncertain'"
      class="cursor-pointer text-lime-300 h-3 inline mr-2"
    />
    <icon-fa-circle-thin
      v-if="(props.value === 'unreviewed' && props.hideUnvalidated === false)"
      class="cursor-pointer text-gray-300 h-3 inline mr-2"
    />
  </div>
</template>
<script setup lang="ts">
import type { ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'

const props = defineProps<{
  value: ReviewStatus,
  hideUnvalidated: boolean
}>()
</script>
