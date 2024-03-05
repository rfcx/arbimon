<template>
  <div class="flex items-center">
    <icon-custom-ic-circle v-if="props.variant === 0" />
    <icon-custom-ic-progress v-if="props.variant === 20" />
    <icon-custom-ic-success v-if="props.variant === 30" />
    <icon-custom-ic-error v-if="props.variant === 40" />
    <icon-custom-ic-cancelled v-if="props.variant === 50" />
    <span class="ml-2 text-base text-insight">{{ classifierStatus.title }}</span>
    <div
      class="w-52 ml-4 bg-pitch rounded-full h-3 border-1"
      :class="`${classifierStatus.borderColor}`"
    >
      <div
        class="h-2.5 rounded-full"
        :style="`width: ${progressFormat(progress)};`"
        :class="`${classifierStatus.bgColor}`"
      />
    </div>
    <span class="ml-2 text-base text-insight">{{ progressFormat(progress) }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { type ClassifierJobStatusNumber, CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

/** Queued, Processing, Done, Error, Cancelled respectively */
const props = withDefaults(defineProps<{ variant: ClassifierJobStatusNumber, progress: number }>(), {
  variant: 0,
  progress: 0
})

const classifierStatus = computed(() => {
  if (props.variant === 0) {
    return {
      title: 'In queue',
      bgColor: 'bg-queue-status',
      borderColor: 'border-queue-status'
    }
  }

  if (props.variant === 20) {
    return {
      title: 'In progress',
      bgColor: 'bg-progress-status',
      borderColor: 'border-progress-status'
    }
  }

  if (props.variant === 30) {
    return {
      title: 'Success',
      bgColor: 'bg-success-status',
      borderColor: 'border-success-status'
    }
  }

  if (props.variant === 40) {
    return {
      title: 'Error',
      bgColor: 'bg-error-status',
      borderColor: 'border-error-status'
    }
  }

  if (props.variant === 50) {
    return {
      title: 'Cancelled',
      bgColor: 'bg-cancelled-status',
      borderColor: 'border-cancelled-status'
    }
  }

  return { title: '', bgColor: '' }
})

/**
 * Returns the end text of the progress bar
 *
 * - will return `''` for jobs with status `WAITING` regardless of the computed value
 * - will return `100%` for jobs with status `DONE` regardless of the computed value
 * - will return actual value for other statuses
 */
const progressFormat = (percentage: number) => {
  if (props.variant === CLASSIFIER_JOB_STATUS.WAITING) {
    return '0%'
  }

  if (props.variant === CLASSIFIER_JOB_STATUS.DONE) {
    return '100%'
  }
  return `${percentage}%`
}
</script>
