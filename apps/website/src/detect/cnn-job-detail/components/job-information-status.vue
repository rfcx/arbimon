<template>
  <div
    id="job-information-spinner"
    :class="variantName"
  />
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'

import { type ClassifierJobStatusNumber } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

/** Queued, Processing, Done, Error, Cancelled respectively */
const props = withDefaults(defineProps<{ variant: ClassifierJobStatusNumber }>(), {
  variant: 0
})

const variantName = computed(() => {
  if (props.variant === 0) {
    return 'queued'
  }

  if (props.variant === 20) {
    return ''
  }

  if (props.variant === 30) {
    return 'done'
  }

  if (props.variant === 40) {
    return 'error'
  }

  if (props.variant === 50) {
    return 'cancelled'
  }

  return ''
})
</script>

<style scoped lang="scss">
// outer spinner
div#job-information-spinner {
  @apply border-2 border-solid border-warning;
  display: block;
  position: relative;
  height: 18px;
  width: 18px;
  border-bottom-color: #000000;
  border-radius: 50%;
  animation: job-information-spinner 1.25s linear infinite;
  -webkit-animation: job-information-spinner 1.25s linear infinite;
}

div#job-information-spinner.queued {
  @apply border-2 border-solid border-warning;
  animation: none;
  -webkit-animation: none;
}

div#job-information-spinner.done {
  @apply border-2 border-solid border-brand-primary;
}

div#job-information-spinner.error {
  @apply border-2 border-solid border-danger;
}

div#job-information-spinner.cancelled {
  @apply border-2 border-solid border-info;
}

// inner dot
div#job-information-spinner::after {
  @apply border-2 border-solid border-warning bg-warning;
  content: "";
  position: absolute;
  top: 3px;
  right: 3px;
  bottom: 3px;
  left: 3px;
  border-radius: 50%;
}

div#job-information-spinner.queued::after {
  @apply border-2 border-solid border-warning bg-warning;
}

div#job-information-spinner.done::after {
  @apply border-2 border-solid border-brand-primary bg-brand-primary;
}

div#job-information-spinner.error::after {
  @apply border-2 border-solid border-danger bg-danger;
}

div#job-information-spinner.cancelled::after {
  @apply border-2 border-solid border-info bg-info;
}

@keyframes job-information-spinner {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  50% {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-webkit-keyframes job-information-spinner {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  50% {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
