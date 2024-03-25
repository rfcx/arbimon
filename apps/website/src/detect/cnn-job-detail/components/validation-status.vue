<template>
  <div>
    <icon-custom-fi-present
      v-if="props.value === 'confirmed'"
      class="h-4 w-4"
    />
    <icon-custom-fi-not-present
      v-if="props.value === 'rejected'"
      class="h-4 w-4"
    />
    <icon-custom-fi-unknown
      v-if="props.value === 'uncertain'"
      class="h-4 w-4"
    />
    <icon-custom-fi-unvalidated
      v-if="(props.value === 'unreviewed' && props.hideUnvalidated === false)"
      class="h-4 w-4"
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
