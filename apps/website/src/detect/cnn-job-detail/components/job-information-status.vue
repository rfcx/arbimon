<template>
  <div class="flex items-center">
    <div class="flex items-center mr-8">
      <icon-custom-ic-circle
        v-if="props.variant === 0"
        class="min-w-4"
      />
      <icon-custom-ic-progress
        v-else-if="props.variant === 20"
        class="min-w-4"
      />
      <icon-custom-ic-success
        v-else-if="props.variant === 30"
        class="min-w-4"
      />
      <icon-custom-ic-error
        v-else-if="props.variant === 40"
        class="min-w-4"
      />
      <icon-custom-ic-cancelled
        v-else
        class="min-w-4"
      />
      <span class="ml-2 text-base text-insight">{{ classifierStatus.title }}</span>
    </div>
    <div class="flex items-center">
      <job-progress
        :status="props.variant"
        :current="progress"
        :total="100"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { type ClassifierJobStatusNumber } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import jobProgress from '@/detect/cnn-job-list/components/job-progress.vue'

/** Queued, Processing, Done, Error, Cancelled respectively */
const props = withDefaults(defineProps<{ variant: ClassifierJobStatusNumber, progress: number }>(), {
  variant: 0,
  progress: 0
})

const classifierStatus = computed(() => {
  if (props.variant === 0) {
    return {
      title: 'Queued'
    }
  }

  if (props.variant === 20) {
    return {
      title: 'In progress'
    }
  }

  if (props.variant === 30) {
    return {
      title: 'Success'
    }
  }

  if (props.variant === 40) {
    return {
      title: 'Error'
    }
  }

  if (props.variant === 50) {
    return {
      title: 'Cancelled'
    }
  }

  if (props.variant === 60) {
    return {
      title: 'Cancelling'
    }
  }

  return { title: '' }
})

</script>
