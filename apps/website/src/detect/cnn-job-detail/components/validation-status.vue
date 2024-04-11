<template>
  <div>
    <icon-custom-fi-present
      v-if="props.value === 'present'"
      class="h-5 w-5"
    />
    <icon-custom-fi-not-present
      v-if="props.value === 'notPresent'"
      class="h-5 w-5"
    />
    <icon-custom-fi-unknown
      v-if="props.value === 'unknown'"
      class="h-5 w-5"
    />
    <icon-custom-fi-unvalidated
      v-if="(props.value === 'unvalidated' && props.hideUnvalidated === false)"
      class="h-5 w-5"
    />
  </div>
</template>
<script setup lang="ts">
import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

const props = defineProps<{
  value: ArbimonReviewStatus,
  hideUnvalidated?: boolean
}>()
</script>
