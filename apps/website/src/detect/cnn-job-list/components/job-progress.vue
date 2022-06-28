<template>
  <div class="mb-1 text-subtle">
    {{ statusLabel }}
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

import { CLASSIFIER_JOB_LABELS, CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { JobProgress } from '../../types'

const props = defineProps<{
  jobProgress: JobProgress
}>()

const statusCode = computed(() => props.jobProgress.status)
const isRunning = computed(() => statusCode.value === CLASSIFIER_JOB_STATUS.RUNNING)
const statusLabel = computed(() => {
  if (!Object.keys(CLASSIFIER_JOB_LABELS).map(Number).includes(statusCode.value)) {
    return 'Unknown'
  }

  return CLASSIFIER_JOB_LABELS[statusCode.value]
})

</script>
