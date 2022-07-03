<template>
  <div class="mb-1 text-subtle">
    {{ statusLabel }}
  </div>
  <el-progress
    v-if="isRunning"
    class="max-w-36"
    :stroke-width="12"
    :percentage="jobProgress.value"
    :indeterminate="true"
  />
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
<style lang="scss">
.el-progress__text {
  font-size: 0.875rem !important;
}
</style>
