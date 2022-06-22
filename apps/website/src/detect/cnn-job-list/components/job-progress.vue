<template>
  <div class="mb-1 text-subtle">
    {{ getStatus(props.jobProgress.status) }}
  </div>
  <div
    v-if="isRunning"
    class="w-14 bg-faded rounded-full h-2.5"
  >
    <div
      class="bg-brand-primary h-2.5 rounded-full"
      :style="{ 'width': `${props.jobProgress.value}%` }"
    >
      <!---->
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { JobProgress } from '../../types'

// TODO: Extract
const getStatus = (s: number): string => {
  switch (s) {
    case 0: return 'Queued'
    case 20: return 'Processing'
    case 30: return 'Done'
    case 40: return 'Error'
    case 50: return 'Cancelled'
    default: return 'Unknown'
  }
}

const props = defineProps<{
  jobProgress: JobProgress
}>()

const isRunning = computed(() => props.jobProgress.status === CLASSIFIER_JOB_STATUS.RUNNING)
</script>
