<template>
  <div>
    <icon-custom-fi-present
      v-if="props.value === 'present'"
      class="h-4 w-4"
    />
    <icon-custom-fi-not-present
      v-if="props.value === 'notPresent'"
      class="h-4 w-4"
    />
    <icon-custom-fi-unknown
      v-if="props.value === 'unknown'"
      class="h-4 w-4"
    />
    <icon-custom-fi-unvalidated
      v-if="(props.value === 'unvalidated' && props.hideUnvalidated === false)"
      class="h-4 w-4"
    />
  </div>
</template>
<script setup lang="ts">
import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

const props = defineProps<{
  value: ArbimonReviewStatus,
  hideUnvalidated: boolean
}>()
</script>
